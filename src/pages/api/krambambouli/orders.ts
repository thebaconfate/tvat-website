import { getAuthToken } from "@/lib/services/auth";
import { krambambouliService } from "@/lib/services/krambambouli";
import type { APIContext } from "astro";

export async function GET({ request, url }: APIContext) {
  const token = getAuthToken(request.headers);
  if (!token) return new Response(null, { status: 401 });
  console.log(url.searchParams);
  const orders = await krambambouliService.getOrders();
  return new Response(JSON.stringify(orders));
}
