import { useItem } from "@/components/shared/hooks/useItem";
import { orderSchema, type OrderData } from "@/lib/domain/krambambouli";

type Props = { order: OrderData };
export function useKrambambouliOrder(props: Props) {
  const { item: order } = useItem<OrderData>({
    id: props.order.id,
    init: props.order,
    baseUrl: "",
    schema: orderSchema,
  });

  return { order };
}
