import type { OrderData } from "@/lib/domain/krambambouli";
import styles from "./KrambambouliOrderItem.module.css";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/domain/datetime";
import { formatCurrency } from "@/lib/utils";
import { useKrambambouliOrder } from "./useKrambambouliOrder";

type Props = {
  order: OrderData;
  locale: string;
};
export default function KrambambouliOrderItem({ locale, ...props }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { order } = useKrambambouliOrder({ order: props.order });
  return (
    <tr className={styles.tr}>
      <td className={styles.td} onClick={() => setExpanded((prev) => !prev)}>
        {expanded ? <ChevronDown /> : <ChevronRight />}
      </td>
      <td className={styles.td}>{order && order.orderNumber}</td>
      <td className={styles.td}>
        {order && formatDate(new Date(order.createdAt), locale, {})}
      </td>
      <td className={styles.td}>
        {order && `${order.firstName} ${order.lastName}`}
      </td>
      <td className={styles.td}>
        {order && formatCurrency(order.totalOwed / 100)}
      </td>
      <td className={styles.td}>{order && order.received ? "Ja" : "Nee"}</td>
      <td className={styles.td}>{order && order.paid ? "Ja" : "Nee"}</td>
    </tr>
  );
}
