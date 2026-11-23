import type { Identifiable, ListApi } from "@/lib/client/client.types";
import type { ListQuery, Page } from "@/lib/domain/page";
import { useCallback, useState } from "react";
import { useDebounced } from "./useDebounced";
import { usePage } from "./usePage";
import { useResource } from "./useResource";

export type ListOptions<Item, Query extends ListQuery> = {
  initialPage?: Page<Item>;
  initialFilters?: Omit<Query, "page">;
};
export function useList<Item extends Identifiable, Query extends ListQuery>(
  api: ListApi<Item, Query>,
  {
    initialPage,
    initialFilters = {} as Omit<Query, "page">,
  }: ListOptions<Item, Query> = {},
) {
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebounced(filters);
  const { page, setPage } = usePage(initialPage?.page.number);

  const filtersKey = JSON.stringify(debouncedFilters);
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const { data, loading, error, refetch, mutate } = useResource(
    (signal) => api.list({ ...debouncedFilters, page } as Query, signal),
    [api, filtersKey, page],
    initialPage,
  );

  const totalPages = data?.page.totalPages ?? 0;
  const next = useCallback(
    () => setPage(Math.min(page + 1, totalPages)),
    [page, totalPages, setPage],
  );
  const prev = useCallback(() => setPage(page - 1), [page, setPage]);

  return {
    items: data?.content ?? [],
    filters,
    setFilters,
    loading,
    error,
    page: data?.page.number ?? page,
    totalPages,
    next,
    prev,
    setPage,
    refetch,
    mutate,
  };
}
