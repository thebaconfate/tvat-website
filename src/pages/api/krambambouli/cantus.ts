import type { Activity } from "../../../lib/activity";
import Database from "../../../lib/db";

export const prerender = false;
export async function GET() {
  const result = await Database.getInstance().then((database) =>
    database.getKrambambouliCantus(),
  );
  if (result) {
    const castedResult = result as Activity[];
    if (castedResult.length > 0)
      return new Response(JSON.stringify(castedResult[0]));
  }
  return new Response(JSON.stringify(null), {
    status: 404,
  });
}
