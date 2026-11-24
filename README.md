# 't VAT website

The website of 't VAT ([www.tvat.be](https://www.tvat.be)): the public pages, the krambambouli
order form, and an admin section (`/app`) for managing orders.

Built with [Astro](https://astro.build) (server-rendered, Node adapter) and React, on a
PostgreSQL database. Emails are sent with [Resend](https://resend.com). Production runs on
[Railway](https://railway.com).

## Getting started

You need **Node 26**, **pnpm** and **Docker** (with the compose plugin). Then:

```sh
scripts/setup.sh
```

It's safe to re-run, and it:

1. installs the tools pinned in `mise.toml` (Node 26, pnpm, the Railway CLI) if you have
   [mise](https://mise.jdx.dev), and otherwise checks the tools on your `PATH`
2. creates `.env` with local defaults and a generated database password
   ([configuration](docs/configuration.md))
3. runs `pnpm install`
4. starts the local database in Docker; a new one gets the schema and development data, and
   then the migrations ([database](docs/database.md))
5. offers to copy the production data, if you have access to the Railway project

Then start the site with `pnpm dev` and open <http://localhost:4321>. To log in to the admin
section, [create the first user](docs/first-user.md).

`scripts/setup.sh --help` lists its options; with mise, `mise run setup` does the same.

> **colima** (Docker without Docker Desktop) only shares your home directory with its VM by
> default, so keep the repo somewhere under `~`.

## Commands

| Command                | What it does                                                  |
| :--------------------- | :------------------------------------------------------------ |
| `scripts/setup.sh`     | Set up the project for local development                      |
| `pnpm dev`             | Start the dev server at `localhost:4321`                      |
| `pnpm build`           | Type-check (`astro check`) and build into `./dist/`           |
| `pnpm preview`         | Serve the production build locally                            |
| `pnpm email:dev`       | Preview the email templates (`emails/`)                       |
| `pnpm db:migrate`      | Apply the database migrations the database doesn't have yet   |
| `scripts/db-pull.sh`   | Replace the local database with a copy of production          |
| `docker compose up -d` | Start the local database (`mise run db:up` also waits for it) |

## Documentation

- [Configuration](docs/configuration.md): the `.env` variables, and where the real values live
- [Database](docs/database.md): the local database, migrations, copying production
- [Activities](docs/activities.md): the sync with the BSK calendar
- [Creating the first user](docs/first-user.md): the first admin account
- [Deployment](docs/deployment.md): how `main` reaches production, and its migrations
