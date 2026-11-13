#!/usr/bin/env bash
# Sets up this project for local development. Safe to re-run.
#
#   1. Tools: Node 24 and Docker (with compose). With mise installed, mise installs the
#      versions pinned in mise.toml; without it, the script checks what's there.
#   2. .env: created with local defaults and a generated database password, or checked for
#      keys that are missing. The README explains every variable.
#   3. npm ci
#   4. The local database (Docker). A new one gets the schema and development data from
#      dev/postgres/.
#   5. Optionally a copy of the production data (scripts/db-pull.sh, needs Railway access).
#
# Usage: scripts/setup.sh [--yes] [--pull]
#   --yes    don't ask anything (no production copy unless --pull is given too)
#   --pull   copy the production data into the local database
set -euo pipefail

cd "$(dirname "$0")/.."

ASSUME_YES=false
PULL=false
for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=true ;;
    --pull) PULL=true ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    *) echo "Unknown argument: $arg (see --help)" >&2; exit 1 ;;
  esac
done

NODE_MAJOR=24 # same as the Dockerfile and CI

step() { printf '\n==> %s\n' "$*"; }
info() { printf '    %s\n' "$*"; }
die() { printf '\nerror: %s\n' "$*" >&2; exit 1; }
interactive() { ! $ASSUME_YES && [[ -t 0 ]]; }
# ask <question> <default y|n>
ask() {
  local answer
  if ! interactive; then [[ "$2" == y ]]; return; fi
  read -r -p "    $1 [$([[ "$2" == y ]] && echo Y/n || echo y/N)] " answer
  answer="${answer:-$2}"
  [[ "$answer" =~ ^[Yy] ]]
}

# Read KEY from .env without sourcing it
env_get() {
  local value
  value="$(grep -E "^$1=" .env | tail -n1 | cut -d= -f2- || true)"
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  printf '%s' "$value"
}

# --- 1. Tools -----------------------------------------------------------------

step "Tools"
# `mise trust --show` lists every config dir mise sees (~ too), so match this project's line
mise_trusted() { mise trust --show 2>/dev/null | grep -qxF "${PWD/#$HOME/\~}: trusted"; }
if command -v mise >/dev/null 2>&1; then
  if ! mise_trusted; then
    if ask "Trust this project's mise.toml (lets mise install its tools and run its tasks)?" y; then
      mise trust --quiet
    fi
  fi
  if mise_trusted; then
    info "mise: installing the tools in mise.toml"
    mise install
    eval "$(mise env -s bash)"
  else
    info "mise: project not trusted, using the tools on your PATH"
  fi
else
  info "mise not found: using the tools on your PATH (https://mise.jdx.dev installs the pinned versions)"
fi

command -v node >/dev/null 2>&1 || die "Node.js not found: install Node $NODE_MAJOR (https://nodejs.org)"
node_major="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$node_major" == "$NODE_MAJOR" ]]; then
  info "node: $(node --version)"
else
  info "node: $(node --version), but production runs Node $NODE_MAJOR; things may differ"
fi

command -v docker >/dev/null 2>&1 || die "Docker not found: install Docker (https://docs.docker.com/get-docker/)"
docker compose version >/dev/null 2>&1 || die "the Docker compose plugin is missing"
docker info >/dev/null 2>&1 || die "Docker isn't running (start Docker Desktop, the docker service, or 'colima start')"
info "docker: $(docker --version | sed 's/,.*//')"

# The PostgreSQL tools db-pull.sh needs run inside the database container.
if ! command -v railway >/dev/null 2>&1; then
  info "optional, only for copying production data: railway not found"
fi

# --- 2. .env ------------------------------------------------------------------

# The .env a new checkout gets: enough to run locally. Every key here is checked in an
# existing .env too. The README ("Configuration") explains each one.
env_template() {
  cat <<EOF
# Local settings, see "Configuration" in the README. Never commit this file.
DB_HOST=localhost
DB_PORT=5432
DB_USER=tvat
DB_PASSWORD=$1
DB_DATABASE=tvat
RESEND_API_KEY=re_development_placeholder
DOMAIN=example.com
VATMAIL=dev@example.com
IBAN=BE00 0000 0000 0000
BIC=GEBABEBB
ACCOUNTHOLDER="'t VAT"
BOOTSTRAP_TOKEN=
EOF
}

# The real values of these (not secrets) are kept as GitHub repository variables, which
# people with write access to the repo can read. A new .env gets them when gh can.
GITHUB_VARIABLES=(DOMAIN VATMAIL IBAN BIC ACCOUNTHOLDER)
fill_from_github_variables() {
  local placeholders="the email and payment values are placeholders"
  if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
    info "$placeholders (with gh installed and logged in, they come from the repo's GitHub variables)"
    return 0
  fi
  local fetched name line filled=()
  # One NAME="value" line per variable; JSON quoting is valid .env quoting for these values
  if ! fetched="$(gh variable list --json name,value --jq '.[] | "\(.name)=\(.value | @json)"' 2>/dev/null)"; then
    info "$placeholders (no access to this repo's GitHub variables)"
    return 0
  fi
  for name in "${GITHUB_VARIABLES[@]}"; do
    line="$(grep -E "^${name}=" <<<"$fetched" | head -n1 || true)"
    [[ -n "$line" ]] || continue
    # ENVIRON instead of awk -v, which would interpret backslashes in the value
    key="$name" line="$line" awk 'index($0, ENVIRON["key"] "=") == 1 { print ENVIRON["line"]; next } { print }' \
      .env > .env.tmp && mv .env.tmp .env
    filled+=("$name")
  done
  if ((${#filled[@]})); then
    info "filled in from the repo's GitHub variables: ${filled[*]}"
  else
    info "$placeholders (the repo has no GitHub variables for them)"
  fi
}

step ".env"
if [[ -f .env ]]; then
  missing_keys=()
  while IFS= read -r key; do
    grep -qE "^${key}=" .env || missing_keys+=("$key")
  done < <(env_template x | grep -oE '^[A-Z_]+=' | tr -d '=')
  if ((${#missing_keys[@]})); then
    info "exists, but lacks: ${missing_keys[*]} (see \"Configuration\" in the README)"
  else
    info "exists and has every key the site needs"
  fi
else
  env_template "$(head -c 18 /dev/urandom | od -An -tx1 | tr -d ' \n')" > .env
  info "created with local defaults and a generated database password"
  fill_from_github_variables
fi
for key in DB_USER DB_PASSWORD DB_DATABASE; do
  [[ -n "$(env_get "$key")" ]] || die "$key is empty in .env"
done

# --- 3. Dependencies ----------------------------------------------------------

step "npm dependencies"
npm ci --no-audit --no-fund

# --- 4. Database --------------------------------------------------------------

step "Database"
docker compose up -d database
info "waiting until it accepts connections ..."
# Over TCP on purpose: while a new volume is being initialised, Postgres runs a temporary
# server on the Unix socket only, which would look ready too early.
db_ready() { docker compose exec -T database pg_isready -q -h 127.0.0.1 2>/dev/null; }
db_running() { [[ -n "$(docker compose ps --status running -q database 2>/dev/null)" ]]; }
for _ in $(seq 1 60); do
  db_ready && break
  # The container stops when an init script fails; no point in waiting then
  db_running || break
  sleep 1
done
if ! db_ready; then
  docker compose logs --tail 15 database >&2 || true
  die "the database didn't start (full log: docker compose logs database)"
fi

db_query() {
  docker compose exec -T database psql -XAtq -U "$(env_get DB_USER)" -d "$(env_get DB_DATABASE)" -c "$1"
}
# Docker sets the password only when the volume is created, so a .env recreated later can
# hold a different one. Check through the container's network address: the image trusts
# the socket and 127.0.0.1 without a password, but asks for one there.
if ! docker compose exec -T -e PGPASSWORD="$(env_get DB_PASSWORD)" \
  -e PGUSER="$(env_get DB_USER)" -e PGDATABASE="$(env_get DB_DATABASE)" database \
  sh -c 'psql -XAtq -h "$(hostname -i | cut -d" " -f1)" -c "select 1"' >/dev/null 2>&1; then
  info "the database doesn't accept the user and password in .env: it was created with others."
  info "Put the old DB_PASSWORD back in .env, or recreate the database with"
  info "'docker compose down -v' (deletes the local data) and run this again."
  die "the site can't connect to the database with these settings"
fi
# A volume created with an older schema keeps it: init scripts only run on a new volume.
if [[ "$(db_query "select count(*) from information_schema.columns where table_name = 'krambambouli_orders' and column_name = 'delivery_fee'")" != 1 ]]; then
  info "this database has an older schema than dev/postgres/initialize-postgres.sql."
  info "Recreate it with 'docker compose down -v' (deletes the local data) and run this again,"
  info "or replace its data with a copy of production (--pull)."
fi
info "ready on localhost:${DB_PORT:-$(env_get DB_PORT)}: $(db_query "select count(*) from products") products, $(db_query "select count(*) from krambambouli_orders") orders"

# --- 5. Production data (optional) ----------------------------------------------

if $PULL || { command -v railway >/dev/null 2>&1 &&
  ask "Replace the local data with a copy of production (needs access to the Railway project)?" n; }; then
  step "Production data"
  scripts/db-pull.sh --yes
fi

step "Done"
info "start the site:  npm run dev   (http://localhost:4321)"
info "first admin user: see 'Creating the first user' in the README"
