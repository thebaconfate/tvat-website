import { activityService } from "@/lib/services/activities";
import type { APIContext } from "astro";

export async function POST({ locals }: APIContext) {
  // The middleware already rejects unauthenticated requests; this is a second line of defence.
  if (!locals.user) return new Response(null, { status: 401 });

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
