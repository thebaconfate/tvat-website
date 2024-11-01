import type { Activity } from "../../../lib/activity";
import database from "../../../lib/db";

export async function GET() {
  const result = await database.getKrambambouliCantus();
  if (result) {
    const castedResult = result as Activity[];
    if (castedResult.length > 0)
      return new Response(JSON.stringify(castedResult[0]));
  }
  return new Response(JSON.stringify(null), {
    status: 404,
  });
}
