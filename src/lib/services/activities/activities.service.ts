import type { ActivityData, ActivityQuery } from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import { fetchBskEvents, type BskEvent } from "@/lib/infrastructure/bsk";
import {
  ActivitiesRepository,
  type ImportedActivity,
} from "@/lib/repositories/activities";

/** Our kring in the BSK calendar. */
const BSK_KRING = "VAT";
/** How long a successful sync counts as fresh. */
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
/** How long to wait before retrying a failed sync, so a BSK outage isn't hammered. */
const RETRY_INTERVAL_MS = 60 * 1000;

export type SyncResult = { fetched: number; changed: number; removed: number };

/** A link only when it's a valid http(s) URL; the BSK also sends "" and null. */
function toUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function toImportedActivity(
  event: BskEvent,
  fetchedAt: string,
): ImportedActivity | null {
  const name = event.title.trim();
  if (!name) return null;
  return {
    bskId: event.id,
    name,
    localTime: event.dateTime.slice(0, 16),
    place: event.place?.trim() || null,
    url: toUrl(event.url),
    // Without an edit time, treat the BSK version as current, so it still syncs.
    bskUpdatedAt: event.updatedAt ?? fetchedAt,
  };
}

class ActivityService {
  private nextSyncAt = 0;
  private runningSync: Promise<SyncResult> | null = null;

  constructor(
    private readonly repository: ActivitiesRepository = new ActivitiesRepository(),
  ) {}

  /** A page of activities. Parse the query with `activityQuerySchema` first. */
  async getActivities(
    query: ActivityQuery = { page: 1 },
  ): Promise<Page<ActivityData>> {
    this.syncIfStale();
    const { page, pageSize, ...filters } = query;
    return this.repository.getActivities(page, pageSize, filters);
  }

  /**
   * Copies our activities from the BSK calendar into the database. Only one sync
   * runs at a time; a call during a sync waits for that one.
   */
  sync(): Promise<SyncResult> {
    this.runningSync ??= this.runSync().finally(() => {
      this.runningSync = null;
    });
    return this.runningSync;
  }

  /** Starts a sync in the background when the last one is too old; never waits or throws. */
  private syncIfStale() {
    if (this.runningSync || Date.now() < this.nextSyncAt) return;
    this.sync().catch((e) =>
      console.error("Syncing activities from the BSK failed:", e),
    );
  }

  private async runSync(): Promise<SyncResult> {
    this.nextSyncAt = Date.now() + RETRY_INTERVAL_MS;
    const fetchedAt = new Date().toISOString();
    const events = await fetchBskEvents(BSK_KRING);
    const byId = new Map<string, ImportedActivity>();
    for (const event of events) {
      const activity = toImportedActivity(event, fetchedAt);
      if (activity) byId.set(activity.bskId, activity);
    }
    // An empty list is far more likely a BSK problem than every activity being
    // cancelled; don't wipe the calendar over it.
    if (byId.size === 0)
      throw new Error("The BSK returned no activities; keeping the stored ones");
    const { changed, removed } = await this.repository.syncBskActivities([
      ...byId.values(),
    ]);
    this.nextSyncAt = Date.now() + SYNC_INTERVAL_MS;
    return { fetched: byId.size, changed, removed };
  }
}

export const activityService = new ActivityService();
