import type { CollectionApi, Identifiable } from "@/lib/client/client.types";
import type { ListQuery, Page } from "@/lib/domain/page";
import { useCallback, useState } from "react";
import { usePage } from "./usePage";
import { useResource } from "./useResource";

/**
 * A page of a collection, plus updating and removing its items. The page from
 * the server is the only copy of the items: `updateItem` swaps the updated item
 * into it, so every component reading `items` sees the change.
 *
 * - `filters`: the query without the page number. Changing them goes back to
 *   page 1. Debounce text filters before passing them in.
 * - `initialPage`: a page rendered on the server for these `filters`, so the
 *   first render needs no request.
 *
 * `updateItem` and `removeItem` throw when the request fails; the component that
 * called them shows its own saving/error state.
 */
export function useCollection<
  Item extends Identifiable,
  Patch,
  Query extends ListQuery,
>(
  api: CollectionApi<Item, Patch, Query>,
  filters: Omit<Query, "page">,
  initialPage?: Page<Item>,
) {
  const { page, setPage } = usePage(initialPage?.page.number);

  // Compared by value, so callers may pass a new filters object every render.
  const filtersKey = JSON.stringify(filters);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    // Set during render, not in an effect, so the list is fetched once (for
    // page 1) instead of first for the old page.
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const { data, loading, error, refetch, mutate } = useResource(
    // `filters` minus the page plus the page is a full query.
    (signal) => api.list({ ...filters, page } as Query, signal),
    [api, filtersKey, page],
    initialPage,
  );

  const totalPages = data?.page.totalPages ?? 0;
  const next = useCallback(
    () => setPage(Math.min(page + 1, totalPages)),
    [page, totalPages, setPage],
  );
  const prev = useCallback(() => setPage(page - 1), [page, setPage]);

  const updateItem = useCallback(
    async (id: Item["id"], patch: Patch) => {
      const updated = await api.update(id, patch);
      mutate((current) => ({
        ...current,
        content: current.content.map((item) =>
          item.id === id ? updated : item,
        ),
      }));
      return updated;
    },
    [api, mutate],
  );

  const removeItem = useCallback(
    async (id: Item["id"]) => {
      await api.remove(id);
      // Reload rather than drop it locally: the page is refilled from the next one.
      refetch();
    },
    [api, refetch],
  );

  return {
    items: data?.content ?? [],
    loading,
    error,
    page,
    totalPages,
    next,
    prev,
    setPage,
    updateItem,
    removeItem,
    refetch,
  };
}
