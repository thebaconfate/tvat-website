import { useResource } from "@/components/shared/hooks/useResource";
import {
  orderSchema,
  type OrderData,
  type OrderPatch,
} from "@/lib/domain/krambambouli";
import { API_ROUTES } from "@/lib/routes";
import { useCallback } from "react";

type Props = { order: OrderData };
export function useKrambambouliOrder(props: Props) {
  const {
    item: order,
    update,
    loading,
    error,
  } = useResource<OrderData>({
    id: props.order.id,
    init: props.order,
    baseUrl: API_ROUTES.KRAMBALBOULI.ORDER.url,
    schema: orderSchema,
  });

  const updateOrder = useCallback(
    // update stores the error itself; swallow it so a failed click doesn't crash the row.
    (patch: OrderPatch) => update(patch).catch(() => undefined),
    [update],
  );

  return { order, updateOrder, loading, error };
}
