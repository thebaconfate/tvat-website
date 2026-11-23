import { activityService } from "@/lib/services/activities";

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
