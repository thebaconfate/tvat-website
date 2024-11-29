import { Auth } from "../../../lib/auth";
import Database from "../../../lib/db";

interface PaymentData {
  customerId: number;
  paid: boolean;
}

export const prerender = false;
export async function PUT({ request }: { request: Request }) {
  const auth = new Auth();
  const passage = auth.requestPassage(request);
  if (!passage) return new Response(null, { status: 401 });
  const paymentData: PaymentData = await request.json();
  return Database.getInstance()
    .then((db) =>
      db.updateKrambambouliPayment(paymentData.customerId, paymentData.paid),
    )
    .then(() => new Response(JSON.stringify(paymentData.paid), { status: 200 }))
    .catch((_: any) => new Response(null, { status: 400 }));
}
