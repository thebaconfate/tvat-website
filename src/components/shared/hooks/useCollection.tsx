import type { CollectionApi, Identifiable } from "@/lib/client/client.types";
import type { ListQuery, Page } from "@/lib/domain/page";
import { useCallback, useState } from "react";
import { usePage } from "./usePage";
import { useResource } from "./useResource";

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

  const filtersKey = JSON.stringify(filters);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const { data, loading, error, refetch, mutate } = useResource(
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
      refetch();
    },
    [api, refetch],
  );

  return {
    items: data?.content ?? [],
    loading,
    error,
    page: data?.page.number ?? page,
    totalPages,
    next,
    prev,
    setPage,
    updateItem,
    removeItem,
    refetch,
  };
}
