import database from "../../../lib/db";

export async function GET() {
  const deliveryLocations = await database.getDeliveryLocations();
  return new Response(JSON.stringify(deliveryLocations));
}
