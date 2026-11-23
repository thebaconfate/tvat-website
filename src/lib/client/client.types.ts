import type { ListQuery, Page } from "@/lib/domain/page";

export type Identifiable = { id: string | number };

/** A resource that can only be listed, e.g. activities on the public website. */
export type ListApi<
  Item extends Identifiable,
  Query extends ListQuery = ListQuery,
> = {
  list: (query: Query, signal?: AbortSignal) => Promise<Page<Item>>;
};

/** A resource that can be listed, updated and removed. */
export type CollectionApi<
  Item extends Identifiable,
  Patch,
  Query extends ListQuery = ListQuery,
> = ListApi<Item, Query> & {
  update: (id: Item["id"], patch: Patch) => Promise<Item>;
  remove: (id: Item["id"]) => Promise<void>;
};
