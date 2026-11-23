import { orderPatchSchema } from "@/lib/domain/krambambouli";
import { krambambouliService } from "@/lib/services/krambambouli";
import type { APIContext } from "astro";
import z4 from "zod/v4";

/** Updates the fields of an order allowed by `orderPatchSchema`, e.g. `{ paid?, received? }`. */
export async function PATCH({ params, request, locals }: APIContext) {
  // The middleware already rejects unauthenticated requests; this is a second line of defence.
  if (!locals.user) return new Response(null, { status: 401 });

  const id = z4.uuid().safeParse(params.id);
  if (!id.success) return new Response(null, { status: 404 });

  let patch;
  try {
    patch = orderPatchSchema.parse(await request.json());
  } catch {
    return new Response(null, { status: 400 });
  }

  try {
    const order = await krambambouliService.patchOrder(id.data, patch);
    if (!order) return new Response(null, { status: 404 });
    return new Response(JSON.stringify(order), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}

/** Deletes an order. */
export async function DELETE({ locals }: APIContext) {
  if (!locals.user) return new Response(null, { status: 401 });
  // TODO: implement deleting an order (and its items and delivery address).
  return new Response(null, { status: 501 });
}
