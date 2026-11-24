import z from "zod/v4";

/**
 * The public calendar of the BSK (Brussels Senioren Konvent), where the kringen
 * upload their activities. Docs: https://www.bsk.brussels/api/docs
 */
const BSK_CALENDAR_URL = "https://www.bsk.brussels/api/public/calendar";

const bskEventSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  dateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/),
  place: z.string().nullish(),
  url: z.string().nullish(),
  updatedAt: z.iso.datetime().nullish(),
});

export type BskEvent = z.infer<typeof bskEventSchema>;

export async function fetchBskEvents(kring: string): Promise<BskEvent[]> {
  const url = `${BSK_CALENDAR_URL}?${new URLSearchParams({ kring, bsk: "false" })}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
  return z.array(bskEventSchema).parse(await response.json());
}
