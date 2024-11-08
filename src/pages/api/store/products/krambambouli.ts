import database from "../../../../lib/db";

export async function GET() {
  const products = await database.getKrambambouliProducts();
  console.log(products);
  return new Response(JSON.stringify(products), {
    headers: { "Content-Type": "application/json" },
  });
}
