import type { Activity } from "../../../lib/activity";
import database from "../../../lib/db";

export async function GET() {
  const result = await database.getKrambambouliCantus();
  const castedResult = result as Activity[];
  return new Response(JSON.stringify(castedResult[0]));
}
