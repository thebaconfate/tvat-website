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
    await krambambouliService.createOrder(order);
  } catch (e) {
    console.error(e);
  } finally {
    return new Response();
  }
}
