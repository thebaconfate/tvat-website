import type { ActivityData, ActivityQuery } from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import { fetchBskEvents, type BskEvent } from "@/lib/infrastructure/bsk";
import {
  ActivitiesRepository,
  type ImportedBSKActivity,
} from "@/lib/repositories/activities";

const BSK_KRING = "VAT";
const SYNC_INTERVAL_MS = 15 * 60 * 1000;
const RETRY_INTERVAL_MS = 60 * 1000;

export type SyncResult = { fetched: number; changed: number; removed: number };

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
): ImportedBSKActivity | null {
  const name = event.title.trim();
  if (!name) return null;
  return {
    bskId: event.id,
    name,
    localTime: event.dateTime.slice(0, 16),
    place: event.place?.trim() || null,
    url: toUrl(event.url),
    bskUpdatedAt: event.updatedAt ?? fetchedAt,
  };
}

class ActivityService {
  private nextSyncAt = 0;
  private runningSync: Promise<SyncResult> | null = null;

  constructor(
    private readonly repository: ActivitiesRepository = new ActivitiesRepository(),
  ) {}

  async getActivities(
    query: ActivityQuery = { page: 1 },
  ): Promise<Page<ActivityData>> {
    this.syncIfStale();
    const { page, pageSize, ...filters } = query;
    return this.repository.getActivities(page, pageSize, filters);
  }

  sync(): Promise<SyncResult> {
    this.runningSync ??= this.runSync().finally(() => {
      this.runningSync = null;
    });
    return this.runningSync;
  }

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
    const byId = new Map<string, ImportedBSKActivity>();
    for (const event of events) {
      const activity = toImportedActivity(event, fetchedAt);
      if (activity) byId.set(activity.bskId, activity);
    }
    if (byId.size === 0)
      throw new Error(
        "The BSK returned no activities; keeping the stored ones",
      );
    const { changed, removed } = await this.repository.syncBskActivities([
      ...byId.values(),
    ]);
    this.nextSyncAt = Date.now() + SYNC_INTERVAL_MS;
    return { fetched: byId.size, changed, removed };
  }
}

export const activityService = new ActivityService();
