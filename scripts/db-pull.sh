#!/usr/bin/env bash
# Pull the remote (production) Postgres database into the local dev database.
#
# - The remote is only read (pg_dump); nothing is ever written to it.
# - The local database is replaced atomically: if the restore fails, it is left untouched.
# - A backup of the local database is written to .db-backups/ before it is replaced.
#
# Remote: by default, pg_dump runs *inside* the Railway Postgres service via `railway ssh`
# and the dump is streamed back, so the database needs no public endpoint and no
# credentials are stored locally. Runs `railway login` / `railway link` when needed.
#
# Configuration (from the environment, falling back to the gitignored .env):
#   RAILWAY_DB_SERVICE    Railway service holding the database (default: Postgres)
#   RAILWAY_DB_ENV        Railway environment (default: the linked environment)
#   REMOTE_DATABASE_URL   optional: dump from this URL directly instead of via Railway
#   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE   the local DB (same as the app uses)
#
# Usage: scripts/db-pull.sh [--yes]
set -euo pipefail

cd "$(dirname "$0")/.."

ASSUME_YES=false
for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=true ;;
    -h|--help) sed -n '2,19p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $arg" >&2; exit 1 ;;
  esac
done

die() { echo "error: $*" >&2; exit 1; }

# Read KEY from the environment, or from .env without sourcing it
# (sourcing would execute its contents and choke on unquoted values with spaces).
env_get() {
  local key="$1" value="${!1:-}"
  if [[ -z "$value" && -f .env ]]; then
    value="$(grep -E "^${key}=" .env | tail -n1 | cut -d= -f2- || true)"
    value="${value%\"}"; value="${value#\"}"
    value="${value%\'}"; value="${value#\'}"
  fi
  printf '%s' "$value"
}

for tool in pg_dump pg_restore psql; do
  command -v "$tool" >/dev/null || die "$tool not found (install the PostgreSQL client tools)"
done

# --- local database -----------------------------------------------------------

LOCAL_HOST="$(env_get DB_HOST)"
LOCAL_PORT="$(env_get DB_PORT)"
LOCAL_USER="$(env_get DB_USER)"
LOCAL_DB="$(env_get DB_DATABASE)"
LOCAL_PASSWORD="$(env_get DB_PASSWORD)"
for v in LOCAL_HOST LOCAL_PORT LOCAL_USER LOCAL_DB; do
  [[ -n "${!v}" ]] || die "missing local DB setting (${v/LOCAL_/DB_})"
done

# Safety: only ever overwrite a database on this machine.
case "$LOCAL_HOST" in
  localhost|127.0.0.1|::1) ;;
  *) die "refusing to overwrite non-local database host '$LOCAL_HOST'" ;;
esac

# Run local commands with libpq env vars so the password never appears in argv.
local_pg() {
  PGHOST="$LOCAL_HOST" PGPORT="$LOCAL_PORT" PGUSER="$LOCAL_USER" \
    PGPASSWORD="$LOCAL_PASSWORD" PGDATABASE="$LOCAL_DB" "$@"
}

db_identity="select inet_server_addr()::text || ':' || inet_server_port() || '/' || current_database() || '/' || (select system_identifier from pg_control_system())"
local_id="$(local_pg psql -XAtqc "$db_identity" 2>/dev/null)" \
  || die "could not connect to the local database (is 'docker compose up -d' running?)"

# --- remote database ----------------------------------------------------------

REMOTE_URL="$(env_get REMOTE_DATABASE_URL)"

if [[ -n "$REMOTE_URL" ]]; then
  # Direct mode: the remote is reachable from this machine.
  remote_id="$(psql "$REMOTE_URL" -XAtqc "$db_identity" 2>/dev/null)" \
    || die "could not connect to the remote database"
  [[ "$remote_id" != "$local_id" ]] || die "remote and local point to the same database"
  remote_desc="$(sed -E 's#^[a-z]+://([^@]*@)?([^/?]+)(/[^?]*)?.*#\2\3#' <<<"$REMOTE_URL") (direct)"
  dump_remote() { pg_dump -Fc --no-owner --no-acl -d "$REMOTE_URL"; }
else
  # Railway mode: run pg_dump inside the database service over `railway ssh`.
  command -v railway >/dev/null || die "railway CLI not found (install it, or set REMOTE_DATABASE_URL)"
  service="$(env_get RAILWAY_DB_SERVICE)"; service="${service:-Postgres}"
  railway_env="$(env_get RAILWAY_DB_ENV)"
  ssh_args=(ssh --service "$service")
  [[ -n "$railway_env" ]] && ssh_args+=(--environment "$railway_env")
  # pg_dump picks up PGUSER/PGPASSWORD/PGDATABASE from the service's own environment.
  dump_remote() { railway "${ssh_args[@]}" -- pg_dump -Fc --no-owner --no-acl; }

  # Log in / link this directory if needed (interactive terminals only).
  interactive() { [[ -t 0 && -t 1 ]]; }
  if ! railway whoami >/dev/null 2>&1; then
    interactive || die "not logged in to Railway (run 'railway login')"
    echo "Not logged in to Railway, starting 'railway login' ..."
    railway login || die "railway login failed"
  fi
  if ! railway status >/dev/null 2>&1; then
    interactive || die "this directory is not linked to a Railway project (run 'railway link')"
    echo "Directory not linked to a Railway project, starting 'railway link' ..."
    railway link || die "railway link failed"
  fi

  # Preflight: checks login, link, service name and that pg_dump exists there.
  remote_version="$(railway "${ssh_args[@]}" -- pg_dump --version 2>&1)" || {
    echo "$remote_version" >&2
    die "could not run pg_dump in Railway service '$service' (run 'railway login' / 'railway link', or set RAILWAY_DB_SERVICE)"
  }
  remote_desc="Railway service '$service'${railway_env:+ ($railway_env)} via railway ssh, $(tr -d '\r' <<<"$remote_version" | tail -n1)"
fi

echo "Remote: $remote_desc (read only)"
echo "Local:  $LOCAL_DB@$LOCAL_HOST:$LOCAL_PORT (will be REPLACED)"

if ! $ASSUME_YES; then
  read -r -p "Continue? [y/N] " answer
  [[ "$answer" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 1; }
fi

# --- sync ---------------------------------------------------------------------

tmp_dump="$(mktemp --suffix=.dump)"
trap 'rm -f "$tmp_dump"' EXIT

echo "Dumping remote database ..."
dump_remote > "$tmp_dump"
# Make sure the archive arrived intact before touching the local database.
pg_restore --list "$tmp_dump" >/dev/null 2>&1 \
  || die "remote dump is empty or corrupted; local database left untouched"

mkdir -p .db-backups
backup=".db-backups/local-$(date +%Y%m%d-%H%M%S).dump"
echo "Backing up local database to $backup ..."
local_pg pg_dump -Fc --no-owner --no-acl -f "$backup"

echo "Restoring into local database ..."
{
  echo "SET client_min_messages = warning;"
  echo "DROP SCHEMA IF EXISTS public CASCADE;"
  echo "CREATE SCHEMA public;"
  pg_restore --no-owner --no-acl -f - "$tmp_dump"
} | local_pg psql -X -q -v ON_ERROR_STOP=1 --single-transaction >/dev/null

echo "Done. Local '$LOCAL_DB' now mirrors the remote. Previous local data: $backup"
