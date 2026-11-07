import { krambambouliService } from "@/lib/services/krambambouli";
import type { APIContext } from "astro";

export async function GET({ url, locals }: APIContext) {
  // The middleware already rejects unauthenticated requests; this is a second line of defence.
  if (!locals.user) return new Response(null, { status: 401 });
  const orders = await krambambouliService.getOrders(url.searchParams);
  return new Response(JSON.stringify(orders), {
    headers: { "Content-Type": "application/json" },
  });
}
