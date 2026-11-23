import z from "zod/v4";

/**
 * The public calendar of the BSK (Brussels Senioren Konvent), where the kringen
 * upload their activities. Docs: https://www.bsk.brussels/api/docs
 */
const BSK_CALENDAR_URL = "https://www.bsk.brussels/api/public/calendar";

const bskEventSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  /** Brussels local time without a zone, e.g. "2025-10-08T20:00"; "T00:00" when no time is set. */
  dateTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/),
  place: z.string().nullish(),
  url: z.string().nullish(),
  /** When the event was last edited at the BSK, e.g. "2026-09-28T09:58:38.121Z". Not in their docs. */
  updatedAt: z.iso.datetime().nullish(),
});

export type BskEvent = z.infer<typeof bskEventSchema>;

/** The events of one kring, excluding the BSK's own events. Throws when the BSK is unreachable or answers unexpectedly. */
export async function fetchBskEvents(kring: string): Promise<BskEvent[]> {
  const url = `${BSK_CALENDAR_URL}?${new URLSearchParams({ kring, bsk: "false" })}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok)
    throw new Error(`GET ${url} failed: ${response.status}`);
  return z.array(bskEventSchema).parse(await response.json());
}
