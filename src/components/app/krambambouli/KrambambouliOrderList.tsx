import { useCollection } from "@/components/shared/hooks/useCollection";
import Input from "@/components/shared/Input";
import LoadError from "@/components/shared/LoadError";
import Pagination from "@/components/shared/Pagination";
import Select from "@/components/shared/Select";
import { ordersApi } from "@/lib/client/krambambouli/orders.api";
import type { OrderData, OrderFilters } from "@/lib/domain/krambambouli";
import type { Page } from "@/lib/domain/page";
import {
  formatCurrency,
  fromDateInput,
  fromYesNo,
  httpErrorMessage,
  toDateInput,
  toNumber,
  toYesNo,
  yesNoOptions,
} from "@/lib/utils";
import KrambambouliOrderItem from "./KrambambouliOrderItem";
import styles from "./KrambambouliOrderList.module.css";

type Props = {
  page: Page<OrderData>;
  locale: string;
};

export default function KrambambouliOrderList(props: Props) {
  const {
    items: orders,
    filters,
    setFilters,
    loading,
    error,
    refetch,
    page,
    totalPages,
    next,
    prev,
    updateItem,
  } = useCollection(ordersApi, { initialPage: props.page });

  const setFilter = <Key extends keyof OrderFilters>(
    key: Key,
    value: OrderFilters[Key],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      {error != null && (
        <LoadError
          className={styles.error}
          message={httpErrorMessage(error, "Bestellingen laden mislukt.")}
          onRetry={refetch}
        />
      )}
      <table
        className={`${styles.table} ${loading ? styles.loading : ""}`}
        aria-busy={loading}
      >
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
                  setFilter("orderNumber", toNumber(e.target.value))
                }
              />
            </th>
            <th className={`${styles.th} ${styles.dateFilters}`}>
              <Input
                type="date"
                value={toDateInput(filters.fromDate)}
                onChange={(e) =>
                  setFilter("fromDate", fromDateInput(e.target.value))
                }
              />
              -
              <Input
                type="date"
                value={toDateInput(filters.toDate)}
                onChange={(e) =>
                  setFilter("toDate", fromDateInput(e.target.value))
                }
              />
            </th>
            <th className={styles.th}>
              <Input
                placeholder="Naam"
                type="text"
                value={filters.name ?? ""}
                onChange={(e) => setFilter("name", e.target.value || undefined)}
              />
            </th>
            <th className={styles.th}>
              <Input
                placeholder="Prijs"
                type="number"
                step={"0.01"}
                value={filters.price != null ? filters.price / 100 : ""}
                onChange={(e) => {
                  const euros = toNumber(e.target.value);
                  setFilter(
                    "price",
                    euros === undefined ? undefined : Math.round(euros * 100),
                  );
                }}
              />
            </th>
            <th className={styles.th}>
              <Select
                placeholder={"Ontvangen?"}
                options={yesNoOptions}
                value={toYesNo(filters.received)}
                onChange={(e) =>
                  setFilter("received", fromYesNo(e.target.value))
                }
              />
            </th>
            <th className={styles.th}>
              <Select
                placeholder={"Betaald?"}
                options={yesNoOptions}
                value={toYesNo(filters.paid)}
                onChange={(e) => setFilter("paid", fromYesNo(e.target.value))}
              />
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <KrambambouliOrderItem
              key={order.id}
              order={order}
              index={index}
              locale={props.locale}
              onUpdate={(patch) => updateItem(order.id, patch)}
            />
          ))}
          <tr className={styles.tr}>
            <td></td>
            <td className={`${styles.td} ${styles.name}`}>Totaal</td>
            <td></td>
            <td></td>
            <td className={styles.td}>
              {formatCurrency(
                orders.reduce((sum, order) => sum + order.totalOwed, 0) / 100,
              )}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <Pagination
        className={styles.pagination}
        page={page}
        totalPages={totalPages}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
