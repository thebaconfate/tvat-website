import { krambambouliOrderFormSchema } from "@/lib/domain/krambambouli";
import { krambambouliService } from "@/lib/services/krambambouli";

export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  try {
    const payload = await request.json();
    const order = krambambouliOrderFormSchema.parse(payload);
    const createdOrder = await krambambouliService.createOrder(order);
    return new Response(JSON.stringify(createdOrder), { status: 201 });
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
