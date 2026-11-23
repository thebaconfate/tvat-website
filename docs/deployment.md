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
