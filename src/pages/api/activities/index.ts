import { activityQuerySchema } from "@/lib/domain/activities";
import { activityService } from "@/lib/services/activities";
import type { APIContext } from "astro";

/** A page of activities, filtered by the query string. Public: the website's calendar. */
export async function GET({ url }: APIContext) {
  const query = activityQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!query.success) return new Response(null, { status: 400 });
  const activities = await activityService.getActivities(query.data);
  return new Response(JSON.stringify(activities), {
    headers: { "Content-Type": "application/json" },
  });
}
