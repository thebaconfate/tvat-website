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

The **Sync activities** workflow (`.github/workflows/sync-activities.yml`) syncs the
activities from the BSK ([activities.md](activities.md)) every hour, by calling the site's
sync endpoint with `curl`. It can also be run by hand from the Actions tab, or with
`gh workflow run sync-activities.yml`.

It needs `SYNC_TOKEN`, the same value in two places:

- on the site's Railway service, as a variable
- in the repo, as an Actions secret: `gh secret set SYNC_TOKEN`

Make it a long random value (`openssl rand -hex 32`). A failed sync shows up as a failed
run, and GitHub emails about it. The `curl` retries are for a sleeping (serverless) site:
Railway says the first request to it may get a 502 while it wakes up.

GitHub only runs scheduled workflows from the default branch, can start them a few minutes
late, and disables them in a public repo after 60 days without commits (it emails a warning
first; re-enable it from the Actions tab).
