import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import styles from "./KrambambouliOrderList.module.css";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/domain/datetime";
import { formatCurrency } from "@/lib/utils";
import type { Page } from "@/lib/domain/page";
import useKrambambouliOrders from "./useKrambambouliOrders";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";

type Props = {
  page: Page<OrderData>;
  locale: string;
};

export default function KrambambouliOrderList(props: Props) {
  const { krambambouliOrderPage, filters } = useKrambambouliOrders({
    page: props.page,
  });
  return (
    <>
      <table className={styles.table}>
        <thead>
          <tr className={styles.tr}>
            <th className={styles.th}></th>
            <th className={styles.th}>
              <Input
                placeholder="Order #"
                type="number"
                value={filters.orderNumber ?? ""}
              />
            </th>
            <th className={styles.th}>
              <Input type="date" value={filters.date ?? ""} />
            </th>
            <th className={styles.th}>
              <Input
                placeholder="Naam"
                type="text"
                value={filters.name ?? ""}
              />
            </th>
            <th className={styles.th}>
              <Input
                placeholder="Prijs"
                type="number"
                value={filters.price ?? ""}
              />
            </th>
            <th className={styles.th}>
              <Select
                placeholder={"Ontvangen?"}
                options={[
                  { label: "Ja", value: "Ja" },
                  { label: "Nee", value: "Nee" },
                ]}
              />
            </th>
            <th className={styles.th}>
              <Select
                placeholder={"Betaald?"}
                options={[
                  { label: "Ja", value: "Ja" },
                  { label: "Nee", value: "Nee" },
                ]}
              />
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
