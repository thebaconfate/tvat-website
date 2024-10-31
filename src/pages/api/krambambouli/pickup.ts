import database from "../../../lib/db";

export async function GET() {
  const result = await database.getPickUpLocation();
  return new Response(JSON.stringify(result));
}
