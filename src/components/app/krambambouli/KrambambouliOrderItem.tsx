import type { OrderData } from "@/lib/domain/krambambouli";
import styles from "./KrambambouliOrderItem.module.css";

type Props = {
  order: OrderData;
};
export default function KrambambouliOrderItem({ order }: Props) {
  return <div>{order.orderNumber}</div>;
}
