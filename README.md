# 't VAT website

The website of 't VAT ([www.tvat.be](https://www.tvat.be)): the public pages, the krambambouli
order form, and an admin section (`/app`) for managing orders.

Built with [Astro](https://astro.build) (server-rendered, Node adapter) and React, on a
PostgreSQL database. Emails are sent with [Resend](https://resend.com). Production runs on
[Railway](https://railway.com).

## Getting started

You need **Node 24** and **Docker** (with the compose plugin). Then:

```sh
scripts/setup.sh
```

It's safe to re-run, and it:

1. installs the tools pinned in `mise.toml` (Node 24, the Railway CLI) if you have
   [mise](https://mise.jdx.dev), and otherwise checks the tools on your `PATH`
2. creates `.env` with local defaults and a generated database password
3. runs `npm ci`
4. starts the local database in Docker; a new one gets the schema and development data
5. offers to copy the production data, if you have access to the Railway project

Then start the site with `npm run dev` and open <http://localhost:4321>.

`scripts/setup.sh --help` lists its options; with mise, `mise run setup` does the same.

> **colima** (Docker without Docker Desktop) only shares your home directory with its VM by
> default, so keep the repo somewhere under `~`.

## Configuration

Settings come from `.env`, which is gitignored: never commit it. `scripts/setup.sh` creates
one with values that are enough to run the site locally, and on a re-run reports keys that
are missing.

| Variable          | What it's for                                                     | Local default              |
| :---------------- | :---------------------------------------------------------------- | :------------------------- |
| `DB_HOST`         | Database host                                                     | `localhost`                |
| `DB_PORT`         | Database port; also the port Docker exposes the database on       | `5432`                     |
| `DB_USER`         | Database user, created by Docker on a new volume                  | `tvat`                     |
| `DB_PASSWORD`     | Database password, set by Docker on a new volume                  | generated                  |
| `DB_DATABASE`     | Database name                                                     | `tvat`                     |
| `RESEND_API_KEY`  | API key for sending emails with Resend                            | placeholder: sending fails |
| `DOMAIN`          | Domain emails are sent from (`no-reply@DOMAIN`)                   | `example.com`              |
| `VATMAIL`         | Address contact form messages are sent to                         | `dev@example.com`          |
| `IBAN`            | Payment details shown in the order confirmation email             | placeholder                |
| `BIC`             | (idem)                                                            | placeholder                |
| `ACCOUNTHOLDER`   | (idem)                                                            | `'t VAT`                   |
| `BOOTSTRAP_TOKEN` | Enables creating the first user, see below; leave empty otherwise | empty                      |

With the placeholder Resend key, sending an email fails and is logged, and orders still go
through. `scripts/db-pull.sh` also reads `RAILWAY_DB_SERVICE` (default `Postgres`) and
`RAILWAY_DB_ENV` (default: the linked environment) when they're set.

## Database

The local database runs in Docker (`docker-compose.yml`). When its volume is first created,
Postgres loads:

- `dev/postgres/initialize-postgres.sql`: the schema
- `dev/postgres/seed.sql`: reference data (roles, products, delivery zones, pickup points),
  without any personal data

These scripts only run on a new volume. To start over with a fresh database (this deletes
your local data):

```sh
docker compose down -v && scripts/setup.sh
```

**Changing the schema:** update `initialize-postgres.sql` (and `seed.sql` if needed) in the
same commit as the code that needs the change, and apply the same change to the production
database.

**A copy of production:** `scripts/db-pull.sh` (or `mise run db:pull`) replaces your local
database with a copy of production's. It runs `pg_dump` inside the Railway Postgres service
over `railway ssh`, so the production database needs no public endpoint, and it backs up your
local database to `.db-backups/` first. You need access to the Railway project
(`railway login`, `railway link`) and the PostgreSQL client tools (`pg_dump`, `psql`).

## Creating the first user

The admin section needs an account. The first one (the root user) is created through a
bootstrap route that only works while `BOOTSTRAP_TOKEN` is set and no root user exists yet:

1. Set `BOOTSTRAP_TOKEN` in `.env` to a random value and restart `npm run dev`.
2. Create the user:

   ```sh
   curl -X POST http://localhost:4321/api/auth/station \
     -H "Content-Type: application/json" \
     -H "x-bootstrap-token: <your BOOTSTRAP_TOKEN>" \
     -d '{"email": "you@example.com", "firstName": "First", "lastName": "Last", "password": "<password>"}'
   ```

   The password needs at least 8 characters, with a lowercase and an uppercase letter, a
   number and a special character.

3. Clear `BOOTSTRAP_TOKEN` again, and log in at <http://localhost:4321/login>.

## Commands

| Command                | What it does                                                  |
| :--------------------- | :------------------------------------------------------------ |
| `scripts/setup.sh`     | Set up the project for local development                      |
| `npm run dev`          | Start the dev server at `localhost:4321`                      |
| `npm run build`        | Type-check (`astro check`) and build into `./dist/`           |
| `npm run preview`      | Serve the production build locally                            |
| `npm run email:dev`    | Preview the email templates (`emails/`)                       |
| `scripts/db-pull.sh`   | Replace the local database with a copy of production          |
| `docker compose up -d` | Start the local database (`mise run db:up` also waits for it) |

## Deployment

Pushing to `main` deploys to production. The **Build** workflow
(`.github/workflows/build.yml`) type-checks and builds every pull request and every push to
`main`. After a successful build of `main`, **Deploy to railway** (`deploy.yml`) runs
`railway up`, and Railway builds the `Dockerfile` and deploys it.
