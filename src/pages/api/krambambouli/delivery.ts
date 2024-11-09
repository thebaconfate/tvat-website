import Database from "../../../lib/db";

export const prerender = false;
export async function GET() {
  const deliveryLocations = await Database.getInstance().then((database) =>
    database.getDeliveryLocations(),
  );
  return new Response(JSON.stringify(deliveryLocations));
}
