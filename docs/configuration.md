# Configuration

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
| `BOOTSTRAP_TOKEN` | Enables creating the first user ([first-user.md](first-user.md)); leave empty otherwise | empty |
| `SYNC_TOKEN`      | Secret for syncing the activities ([activities.md](activities.md)); empty disables syncing | empty |

**Real values for `DOMAIN`, `VATMAIL`, `IBAN`, `BIC` and `ACCOUNTHOLDER`** are kept as GitHub
repository variables (Settings → Secrets and variables → Actions → Variables), which people
with write access to the repo can read. They aren't secrets, but they don't belong in the
public code either. When `gh` is installed and logged in, `setup.sh` fills them into a new
`.env`. When one changes, update it there (`gh variable set IBAN`) and in Railway, where
production reads it.

Secrets, like the production `RESEND_API_KEY`, are only kept in Railway. With the placeholder
Resend key, sending an email fails and is logged, and orders still go through.

`scripts/db-pull.sh` also reads `RAILWAY_DB_SERVICE` (default `Postgres`) and
`RAILWAY_DB_ENV` (default: the linked environment) when they're set.
