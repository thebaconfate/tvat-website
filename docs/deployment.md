# Deployment

Pushing to `main` deploys to production. The **Build** workflow
(`.github/workflows/build.yml`) type-checks and builds every pull request and every push to
`main`. After a successful build of `main`, **Deploy to railway** (`deploy.yml`) runs
`railway up`, and Railway builds the `Dockerfile` and deploys it.

## Database migrations

The site's Railway service has `pnpm db:migrate` as its **pre-deploy command** (Settings →
Deploy). Railway runs it in the new image before that version goes live, with the same
variables as the site; if it fails, the deploy stops and the running version stays up. The
image contains `migrations/` and `scripts/migrate.ts` for this (see the `Dockerfile`), and
starts the server with `CMD`, which the pre-deploy command replaces.

How migrations work: [database.md](database.md).

## Scheduled activity sync

A separate Railway service, a **cron job**, syncs the activities from the BSK
([activities.md](activities.md)) by calling the site's sync endpoint:

- **Source:** the Docker image `curlimages/curl`
- **Cron schedule** (Settings): e.g. `0 * * * *` (every hour, in UTC)
- **Start command:**

  ```sh
  sh -c 'curl -fsS -X POST -H "x-sync-token: $SYNC_TOKEN" https://www.tvat.be/api/activities/sync'
  ```

- **Variables:** `SYNC_TOKEN`, the same value as on the site's service (a reference variable,
  `${{<site service>.SYNC_TOKEN}}`, keeps them in sync)

The site's service needs `SYNC_TOKEN` too: a long random value (`openssl rand -hex 32`).
`curl -f` makes the job fail when the endpoint answers with an error, so a failed sync shows
up in the cron service's logs.
