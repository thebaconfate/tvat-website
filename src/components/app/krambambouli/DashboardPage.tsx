import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import styles from "./DashboardPage.module.css";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/domain/datetime";
import { formatCurrency } from "@/lib/utils";
import type { Page } from "@/lib/domain/page";
import useKrambambouliOrders from "./useKrambambouliOrders";

type Props = {
  page: Page<OrderData>;
  locale: string;
};

export default function DashboardPage(props: Props) {
  const { krambambouliOrderPage } = useKrambambouliOrders({
    page: props.page,
  });
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}></th>
            <th className={styles.th}>
              <input placeholder="Order #" />
            </th>
            <th className={styles.th}>
              <input placeholder="Datum" />
            </th>
            <th className={styles.th}>
              <input placeholder="Naam" />
            </th>
            <th className={styles.th}>
              <input placeholder="Prijs" />
            </th>
            <th className={styles.th}>
              <input placeholder="Ontvangen" />
            </th>
            <th className={styles.th}>
              <input placeholder="Betaald" />
            </th>
          </tr>
        </thead>
        <tbody>
          {krambambouliOrderPage &&
            krambambouliOrderPage.content.map((order, index) => {
              const [expanded, setExpanded] = useState(false);
              return (
                <tr
                  key={index}
                  className={styles.tr}
                  onClick={() => setExpanded((prev) => !prev)}
                >
                  <td className={styles.td}>
                    {expanded ? <ChevronDown /> : <ChevronRight />}
                  </td>
                  <td className={styles.td}>{order.orderNumber}</td>
                  <td className={styles.td}>
                    {formatDate(new Date(order.createdAt), props.locale, {})}
                  </td>
                  <td
                    className={styles.td}
                  >{`${order.firstName} ${order.lastName}`}</td>
                  <td className={styles.td}>
                    {formatCurrency(order.totalOwed / 100)}
                  </td>
                  <td className={styles.td}>{order.received ? "Ja" : "Nee"}</td>
                  <td className={styles.td}>{order.paid ? "Ja" : "Nee"}</td>
                </tr>
              );
            })}
          <tr className={styles.tr}>
            <td></td>
            <td className={`${styles.td} ${styles.name}`}>Totaal</td>
            <td></td>
            <td></td>
            <td className={styles.td}>
              {krambambouliOrderPage &&
                formatCurrency(
                  krambambouliOrderPage.content.reduce(
                    (acc, o) => acc + o.totalOwed,
                    0,
                  ) / 100,
                )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
