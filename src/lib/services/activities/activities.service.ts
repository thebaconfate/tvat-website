import type { ActivityData, ActivityQuery } from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import { fetchBskEvents, type BskEvent } from "@/lib/infrastructure/bsk";
import {
  ActivitiesRepository,
  type ImportedBSKActivity,
} from "@/lib/repositories/activities";

const BSK_KRING = "VAT";

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

/** Today in Brussels, e.g. "2026-11-24". */
function todayInBrussels(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Brussels",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
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
  private runningSync: Promise<SyncResult> | null = null;

  constructor(
    private readonly repository: ActivitiesRepository = new ActivitiesRepository(),
  ) {}

  async getActivities(
    query: ActivityQuery = { page: 1 },
  ): Promise<Page<ActivityData>> {
    const { page, pageSize, ...filters } = query;
    return this.repository.getActivities(page, pageSize, filters);
  }

  sync(): Promise<SyncResult> {
    this.runningSync ??= this.runSync().finally(() => {
      this.runningSync = null;
    });
    return this.runningSync;
  }

  private async runSync(): Promise<SyncResult> {
    const fetchedAt = new Date().toISOString();
    const fromDay = todayInBrussels();
    const events = await fetchBskEvents(BSK_KRING);
    if (events.length === 0)
      throw new Error(
        "The BSK returned no activities; keeping the stored ones",
      );
    // Only today and later: the BSK decides what's coming up, the past stays as it is.
    const byId = new Map<string, ImportedBSKActivity>();
    for (const event of events) {
      if (event.dateTime.slice(0, 10) < fromDay) continue;
      const activity = toImportedActivity(event, fetchedAt);
      if (activity) byId.set(activity.bskId, activity);
    }
    const { changed, removed } = await this.repository.syncBskActivities(
      [...byId.values()],
      fromDay,
    );
    return { fetched: byId.size, changed, removed };
  }
}

export const activityService = new ActivityService();
