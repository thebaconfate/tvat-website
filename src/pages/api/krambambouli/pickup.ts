import Database from "../../../lib/db";

export const prerender = false;
export async function GET() {
  const result = await Database.getInstance().then((database) =>
    database.getPickUpLocation(),
  );
  return new Response(JSON.stringify(result));
}
