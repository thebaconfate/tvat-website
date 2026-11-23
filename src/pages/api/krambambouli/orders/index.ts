import {
  krambambouliOrderFormSchema,
  orderQuerySchema,
} from "@/lib/domain/krambambouli";
import {
  krambambouliService,
  OrderConflictError,
} from "@/lib/services/krambambouli";
import type { APIContext } from "astro";

/** A page of orders, filtered by the query string. Dashboard only. */
export async function GET({ url, locals }: APIContext) {
  // The middleware already rejects unauthenticated requests; this is a second line of defence.
  if (!locals.user) return new Response(null, { status: 401 });
  const query = orderQuerySchema.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!query.success) return new Response(null, { status: 400 });
  const orders = await krambambouliService.getOrders(query.data);
  return new Response(JSON.stringify(orders), {
    headers: { "Content-Type": "application/json" },
  });
}

/** Creates an order. Public: used by the order form on the website. */
export async function POST({ request }: APIContext): Promise<Response> {
  let order;
  try {
    order = krambambouliOrderFormSchema.parse(await request.json());
  } catch (e) {
    return new Response(null, { status: 400 });
  }

  try {
    const {
      order: savedOrder,
      created,
      emailSent,
    } = await krambambouliService.createOrder(order);
    return new Response(JSON.stringify({ ...savedOrder, emailSent }), {
      status: created ? 201 : 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    if (e instanceof OrderConflictError)
      return new Response(null, { status: 409 });
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
