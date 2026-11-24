# Database

The site uses PostgreSQL. The connection settings are the `DB_*` variables in `.env`
([configuration.md](configuration.md)).

## The local database

The local database runs in Docker (`docker-compose.yml`). When its volume is first created,
Postgres loads:

- `dev/postgres/initialize-postgres.sql`: the starting schema
- `dev/postgres/seed.sql`: reference data (roles, products, delivery zones, pickup points),
  without any personal data

These scripts only run on a new volume. `scripts/setup.sh` then applies the migrations (below)
on top. To start over with a fresh database (this deletes your local data):

```sh
docker compose down -v && scripts/setup.sh
```

## Changing the schema: migrations

Add a migration: a new SQL file in `migrations/`, named `YYYY-MM-DD-what-it-does.sql`, in the
same commit as the code that needs it.

- Write it so the code that is still running keeps working with it (add before you remove),
  because it is applied before the new code goes live.
- `initialize-postgres.sql` stays as it is: it is the starting point every database gets the
  migrations on top of.
- Never change a migration once it has run anywhere; add a new one instead.

`pnpm db:migrate` (`scripts/migrate.ts`) applies the migrations a database doesn't have yet, in
name order, and records them in its `schema_migrations` table. Each one runs in a transaction,
so it is either applied completely or not at all, and two runs at once take turns.

- **Locally:** `scripts/setup.sh` runs it, also after copying production (below). Run
  `pnpm db:migrate` yourself after pulling a branch that adds a migration.
- **Production:** it is Railway's pre-deploy command ([deployment.md](deployment.md)), so a
  deploy only goes live once its migrations are in.

## A copy of production

`scripts/db-pull.sh` (or `mise run db:pull`) replaces your local database with a copy of
production's. It runs `pg_dump` inside the Railway Postgres service over `railway ssh`, so the
production database needs no public endpoint, and it backs up your local database to
`.db-backups/` first. You need access to the Railway project (`railway login`,
`railway link`). The PostgreSQL tools it uses locally run inside the database container, so
they needn't be installed.
