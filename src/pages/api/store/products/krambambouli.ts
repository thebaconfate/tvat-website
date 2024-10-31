import database from "../../../../lib/db";

export async function GET() {
  const result = await database.getKrambambouliProducts();
  console.log(result);
}
