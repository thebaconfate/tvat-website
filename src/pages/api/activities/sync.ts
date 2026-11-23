import { activityService } from "@/lib/services/activities";

/**
 * Syncs the activities from the BSK calendar now, instead of waiting for the
 * automatic sync. Requires a login: the middleware only makes GET /api/activities public.
 */
export async function POST() {
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
