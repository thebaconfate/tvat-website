import { krambambouliOrderFormSchema } from "@/lib/domain/krambambouli";
import { krambambouliService } from "@/lib/services/krambambouli";
import { resendService } from "@/lib/services/resend/resend.service";

export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  try {
    const payload = await request.json();
    const order = krambambouliOrderFormSchema.parse(payload);
    const createdOrder = await krambambouliService.createOrder(order);
    // resendService
  } catch (e) {
    console.error(e);
  } finally {
    return new Response();
  }
}
