import type { ListQuery, Page } from "@/lib/domain/page";

/** Anything with an id: a UUID string for some tables, an integer for others. */
export type Identifiable = { id: string | number };

/**
 * The client-side API of a resource that can be listed, updated and removed.
 * Implementations know the URLs, send the requests and parse the responses with
 * Zod; the hooks only call these functions.
 *
 * - `Patch`: the fields `update` may send, e.g. `OrderPatch`.
 * - `Query`: what `list` takes, `ListQuery` plus the resource's filters, e.g. `OrderQuery`.
 */
export type CollectionApi<
  Item extends Identifiable,
  Patch,
  Query extends ListQuery = ListQuery,
> = {
  list: (query: Query, signal?: AbortSignal) => Promise<Page<Item>>;
  update: (id: Item["id"], patch: Patch) => Promise<Item>;
  remove: (id: Item["id"]) => Promise<void>;
};
