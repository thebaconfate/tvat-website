import type { ListQuery, Page } from "@/lib/domain/page";

export type Identifiable = { id: string | number };

export type CollectionApi<
  Item extends Identifiable,
  Patch,
  Query extends ListQuery = ListQuery,
> = {
  list: (query: Query, signal?: AbortSignal) => Promise<Page<Item>>;
  update: (id: Item["id"], patch: Patch) => Promise<Item>;
  remove: (id: Item["id"]) => Promise<void>;
};
