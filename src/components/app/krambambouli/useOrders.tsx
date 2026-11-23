import { useCollection } from "@/components/shared/hooks/useCollection";
import { useDebounced } from "@/components/shared/hooks/useDebounced";
import { ordersApi } from "@/lib/client/krambambouli/orders.api";
import type { OrderData, OrderFilters } from "@/lib/domain/krambambouli";
import type { Page } from "@/lib/domain/page";
import { useState } from "react";

/**
 * The dashboard's orders: a filtered page of them, and updating them.
 * `initialPage` must be the server's page for `initialFilters`.
 */
export function useOrders(
  initialPage?: Page<OrderData>,
  initialFilters: OrderFilters = {},
) {
  const [filters, setFilters] = useState(initialFilters);
  // The inputs show `filters` right away; requests wait until typing pauses.
  const debouncedFilters = useDebounced(filters);
  return {
    ...useCollection(ordersApi, debouncedFilters, initialPage),
    filters,
    setFilters,
  };
}
