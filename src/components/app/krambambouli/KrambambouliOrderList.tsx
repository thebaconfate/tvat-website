import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import styles from "./KrambambouliOrderList.module.css";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const initialFromDate = useMemo(() => new Date(), []);
  initialFromDate.setMonth(initialFromDate.getMonth() - 1);
  const { krambambouliOrderPage, filters, setFilters, error } =
    useKrambambouliOrders({
      page: props.page,
      filters: {
        orderNumber: null,
        fromDate: initialFromDate.toISOString().split("T")[0],
        toDate: null,
        name: "",
        price: null,
        received: null,
        paid: null,
      },
    });

  console.log(filters);

  return (
    <>
      {error ? (
        error
      ) : (
        <table className={styles.table}>
          <thead>
            <tr className={styles.tr}>
              <th className={styles.th}></th>
              <th className={styles.th}>
                <Input
                  placeholder="Order #"
                  type="number"
                  name="orderNumber"
                  id="orderNumber"
                  value={filters.orderNumber ?? ""}
                  onChange={(e) =>
                    setFilters((f) => {
                      if (e.target.value === "")
                        return { ...f, orderNumber: null };
                      else
                        return { ...f, orderNumber: parseInt(e.target.value) };
                    })
                  }
                />
              </th>
              <th className={`${styles.th} ${styles.dateFilters}`}>
                <Input
                  type="date"
                  value={filters.fromDate ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, fromDate: e.target.value ?? null })
                  }
                />
                -
                <Input
                  type="date"
                  value={filters.toDate ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, toDate: e.target.value ?? null })
                  }
                />
              </th>
              <th className={styles.th}>
                <Input
                  placeholder="Naam"
                  type="text"
                  value={filters.name ?? ""}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value ?? null })
                  }
                />
              </th>
              <th className={styles.th}>
                <Input
                  placeholder="Prijs"
                  type="number"
                  step={"0.01"}
                  value={filters.price != null ? filters.price / 100 : ""}
                  onChange={(e) => {
                    setFilters({
                      ...filters,
                      price:
                        e.target.value === ""
                          ? null
                          : Math.round(parseFloat(e.target.value) * 100),
                    });
                  }}
                />
              </th>
              <th className={styles.th}>
                <Select
                  placeholder={"Ontvangen?"}
                  options={[
                    { label: "Ja", value: "Ja" },
                    { label: "Nee", value: "Nee" },
                  ]}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      received:
                        e.target.value === "Ja"
                          ? true
                          : e.target.value === "Nee"
                            ? false
                            : null,
                    }));
                  }}
                />
              </th>
              <th className={styles.th}>
                <Select
                  placeholder={"Betaald?"}
                  options={[
                    { label: "Ja", value: "Ja" },
                    { label: "Nee", value: "Nee" },
                  ]}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      paid:
                        e.target.value === "Ja"
                          ? true
                          : e.target.value === "Nee"
                            ? false
                            : null,
                    }));
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {krambambouliOrderPage &&
              krambambouliOrderPage.content.map((order, index) => {
                return (
                  <tr key={index} className={styles.tr}>
                    <td className={styles.td}>
                      <ChevronDown />
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
                    <td className={styles.td}>
                      {order.received ? "Ja" : "Nee"}
                    </td>
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
      )}
    </>
  );
}
