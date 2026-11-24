# Activities

The activities on the homepage and the calendar (`/activities`) come from the calendar of the
**BSK** (Brussels Senioren Konvent, the umbrella association), where the kringen upload them.
The site copies 't VAT's activities into its own `activities` table and shows them from there.

## The sync

- **Source:** `GET https://www.bsk.brussels/api/public/calendar?kring=VAT&bsk=false`, public,
  no login ([BSK API docs](https://www.bsk.brussels/api/docs)). It returns all of our
  activities at once.
- **When:** whenever `POST /api/activities/sync` is called with `SYNC_TOKEN` in the
  `x-sync-token` header. The **Sync activities** workflow does that every hour
  ([deployment.md](deployment.md)). It returns what changed. To sync right away, run that
  workflow from the Actions tab (or `gh workflow run sync-activities.yml`), or:

  ```sh
  curl -X POST -H "x-sync-token: <SYNC_TOKEN>" https://www.tvat.be/api/activities/sync
  ```

  Without `SYNC_TOKEN` set (as locally by default), the endpoint answers 403 and nothing
  syncs.
- **Only today and later:** upcoming activities come solely from the BSK. Activities before
  today (Brussels time) are left as they are, so the history stays even after the BSK drops
  old activities from its list (it returns roughly the last year).
- **What it does**, in one SQL statement (`ActivitiesRepository.syncBskActivities`): adds new
  BSK activities from today on, updates changed ones, and deletes the ones from today on that
  the BSK no longer lists. Activities added here by hand (no `bsk_id`) are left alone. If the
  BSK returns no activities at all, nothing is deleted.

## Edited in both places: the latest edit wins

`updated_at` is when our copy last changed. The sync sets it to the BSK's edit time, and only
replaces our copy when the BSK edited it later than that.

**So when you change an activity by hand, set `updated_at = now()` in the same `UPDATE`**, or
the next sync replaces your change with the BSK's version:

```sql
UPDATE activities SET name = 'Nieuwe naam', updated_at = now() WHERE id = 42;
```

Deleting an upcoming activity at the BSK always deletes our copy: the BSK doesn't say when
something was deleted, so there is nothing to compare.

## From their shape to ours

`toImportedActivity` (`src/lib/services/activities/activities.service.ts`):

| BSK            | Our column      | How                                                              |
| :------------- | :-------------- | :--------------------------------------------------------------- |
| `id`           | `bsk_id`        | as is; matches the activity on later syncs                       |
| `title`        | `name`          | trimmed; activities without a title are skipped                  |
| `dateTime`     | `occurs_at`     | Brussels local time without a zone (`2025-10-08T20:00`)          |
| `place`        | `location_name` | trimmed; empty becomes NULL                                      |
| `url`          | `facebook_url`  | only a valid http(s) link; often, but not always, Facebook       |
| `updatedAt`    | `updated_at`    | the BSK's edit time; not in their docs                           |

The BSK stores activities without a time at midnight (`T00:00`), so the site shows no time for
an activity at exactly 00:00. `endDate` (activities spanning several days) is not stored: those
show their first day.

## Later

**Merging with our own activities.** Once the site can create activities (it can't yet), the
sync could match them with BSK activities on the same day and fill in what one side lacks,
instead of keeping both. Until then, upcoming activities come only from the BSK.

**A two-way sync.** Activities created on our site could also be posted to the BSK (their API takes a kring
login), so each activity exists once on both sides. That needs a `bsk_updated_at` column, to
know which local changes the BSK doesn't have yet.
