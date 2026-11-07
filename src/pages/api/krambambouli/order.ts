import { krambambouliOrderFormSchema } from "@/lib/domain/krambambouli";
import {
  krambambouliService,
  OrderConflictError,
} from "@/lib/services/krambambouli";
import type { APIContext } from "astro";

export async function POST({ request }: APIContext): Promise<Response> {
  let order;
  try {
    order = krambambouliOrderFormSchema.parse(await request.json());
  } catch (e) {
    return new Response(null, { status: 400 });
  }

  try {
    const { order: savedOrder, created, emailSent } =
      await krambambouliService.createOrder(order);
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
