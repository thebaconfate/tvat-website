import { getAuthToken } from "@/lib/services/auth";
import { krambambouliService } from "@/lib/services/krambambouli";
import type { APIContext } from "astro";

export async function GET({ request, url }: APIContext) {
  const token = getAuthToken(request.headers);
  if (!token) return new Response(null, { status: 401 });
  const orders = await krambambouliService.getOrders(url.searchParams);
  return new Response(JSON.stringify(orders));
}
