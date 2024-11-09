import Database from "../../../../lib/db";

export const prerender = false;
export async function GET() {
  const products = await Database.getInstance().then((database) =>
    database.getKrambambouliProducts(),
  );
  return new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  });
}
