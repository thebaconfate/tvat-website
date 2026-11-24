import { activityService } from "@/lib/services/activities";
import type { APIContext } from "astro";
import { timingSafeEqual } from "node:crypto";

/** Compares in constant time, so the token can't be worked out from response times. */
function isSyncToken(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Syncs the activities from the BSK calendar. Called on a schedule by the "Sync
 * activities" workflow (.github/workflows/sync-activities.yml), which sends SYNC_TOKEN
 * in the x-sync-token header. The middleware lets this route through without a login,
 * so this check is the only one.
 */
export async function POST({ request }: APIContext) {
  const syncToken = process.env.SYNC_TOKEN;
  if (!syncToken) return new Response("Sync disabled", { status: 403 });
  if (!isSyncToken(request.headers.get("x-sync-token"), syncToken))
    return new Response(null, { status: 401 });

  try {
    const result = await activityService.sync();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 502 });
  }
}
