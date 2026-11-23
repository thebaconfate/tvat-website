import { useCollection } from "@/components/shared/hooks/useCollection";
import { useDebounced } from "@/components/shared/hooks/useDebounced";
import { ordersApi } from "@/lib/client/krambambouli/orders.api";
import type { OrderData, OrderFilters } from "@/lib/domain/krambambouli";
import type { Page } from "@/lib/domain/page";
import { useState } from "react";

export function useOrders(
  initialPage?: Page<OrderData>,
  initialFilters: OrderFilters = {},
) {
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebounced(filters);
  return {
    ...useCollection(ordersApi, debouncedFilters, initialPage),
    filters,
    setFilters,
  };
}
