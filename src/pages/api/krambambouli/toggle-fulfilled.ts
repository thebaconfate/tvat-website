import type { APIContext } from "astro";
import z from "zod";
import { Auth } from "../../../lib/auth/auth";
import Database from "../../../lib/database";

const schema = z.object({
  customerId: z.number().nonnegative().int(),
  fulfilled: z.boolean(),
});
export async function PUT({ request }: APIContext) {
  const auth = new Auth();
  const authorized = auth.requestPassage(request);
  if (!authorized)
    return new Response(null, { status: 401, statusText: "Unauthorized" });
  try {
    const payload = await request.json();
    const data = schema.parse(payload);
    const database = await Database.getInstance();
    await database.updateKrambambouliFulfillment(
      data.customerId,
      data.fulfilled,
    );
    return new Response(JSON.stringify(data.fulfilled));
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 400 });
  }
}
