import { useLegacyResource } from "@/components/shared/hooks/useLegacyResource";
import {
  orderSchema,
  type OrderData,
  type OrderPatch,
} from "@/lib/domain/krambambouli";
import { API_ROUTES } from "@/lib/routes";
import { startTransition, useCallback, useOptimistic } from "react";

type Props = { order: OrderData };
export function useKrambambouliOrder(props: Props) {
  const {
    item: order,
    update,
    loading,
    error,
  } = useLegacyResource<OrderData>({
    id: props.order.id,
    init: props.order,
    baseUrl: API_ROUTES.KRAMBALBOULI.ORDERS.url,
    schema: orderSchema,
  });

  // Show a patch right away; once the request settles this falls back to `order`,
  // which holds the server's result, or the old value if the save failed.
  const [optimisticOrder, applyPatch] = useOptimistic(
    order,
    (current: OrderData | undefined, patch: OrderPatch) =>
      current && { ...current, ...patch },
  );

  const updateOrder = useCallback(
    (patch: OrderPatch) =>
      startTransition(async () => {
        applyPatch(patch);
        // update stores the error itself; swallow it so a failed click doesn't crash the row.
        await update(patch).catch(() => undefined);
      }),
    [update],
  );

  return { order: optimisticOrder, updateOrder, loading, error };
}
