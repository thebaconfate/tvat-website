import type { APIContext } from "astro";
import { Auth } from "../../../lib/auth/auth";
import z from "zod";

const schema = z.object({
  customerId: z
    .number({ message: "customerId is not a number" })
    .nonnegative({ message: "customerId is not nonnegative" })
    .int({ message: "customerId is not an integer" }),
  paid: z.boolean({ message: "paid is not an integer" }),
});

export async function PUT({ request }: APIContext) {
  return new Response();
  /*
  const auth = new Auth();
  const authorized = await auth.requestPassage(request);
  if (!authorized)
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  try {
    const payload = await request.json();
    const data = schema.parse(payload);
    const database = await Database.getInstance();
    await database.updateKrambambouliPayment(data.customerId, data.paid);
    return new Response(JSON.stringify(data.paid));
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 400 });
  }
  */
}
