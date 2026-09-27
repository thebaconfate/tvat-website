import type { Page } from "@/lib/domain/page";
import { useEffect, useRef, useState } from "react";
import type { ZodType } from "zod/v4";
import { useDebounced } from "./useDebounced";

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
type BaseFilters = Record<string, Primitive>;

export function usePage<
  Item,
  Filters extends BaseFilters,
  ItemPage extends Page<Item>,
  Schema extends ZodType<ItemPage>,
>(
  url: string,
  initialFilters: Filters,
  schema: Schema,
  initialPage?: ItemPage,
) {
  const [itemPage, setItemPage] = useState(initialPage);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const firstRenderSkipped = useRef(false);
  const debouncedFilters = useDebounced(filters);

  useEffect(() => {
    if (initialPage && !firstRenderSkipped.current) {
      firstRenderSkipped.current = true;
      return;
    }
    const searchParams = new URLSearchParams();
    searchParams.append("page", String(page));
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        searchParams.append(key, String(value));
    });
    setLoading(true);
    setItemPage(undefined);
    fetch(`${url}?${searchParams.toString()}`)
      .then((response) => response.json())
      .then((data) => schema.parse(data))
      .then((newContent) => {
        setItemPage(newContent);
        setLoading(false);
      })
      .catch((e) => {
        setError(e);
      });
  }, [debouncedFilters, page]);

  return { itemPage, filters, setFilters, setPage, page, error, loading };
}
