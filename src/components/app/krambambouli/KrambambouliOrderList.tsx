import { Button } from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import type { OrderData, OrderFilters } from "@/lib/domain/krambambouli";
import type { Page } from "@/lib/domain/page";
import { formatCurrency, HttpError } from "@/lib/utils";
import KrambambouliOrderItem from "./KrambambouliOrderItem";
import styles from "./KrambambouliOrderList.module.css";
import { useOrders } from "./useOrders";

type Props = {
  page: Page<OrderData>;
  locale: string;
};

const yesNoOptions = [
  { label: "Ja", value: "Ja" },
  { label: "Nee", value: "Nee" },
];

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
  } = useOrders(props.page);

  const setFilter = <Key extends keyof OrderFilters>(
    key: Key,
    value: OrderFilters[Key],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      {error != null && (
        <p className={styles.error} role="alert">
          {loadErrorMessage(error)}{" "}
          <Button variant="secondary" onClick={refetch}>
            Opnieuw proberen
          </Button>
        </p>
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
      {totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagina's">
          <Button variant="secondary" onClick={prev} disabled={page <= 1}>
            Vorige
          </Button>
          <span>
            Pagina {page} van {totalPages}
          </span>
          <Button
            variant="secondary"
            onClick={next}
            disabled={page >= totalPages}
          >
            Volgende
          </Button>
        </nav>
      )}
    </>
  );
}

/** A number from an input, or undefined when it's empty or not a number. */
function toNumber(value: string): number | undefined {
  const number = parseFloat(value);
  return Number.isNaN(number) ? undefined : number;
}

/** `yyyy-mm-dd` for a date input. Filter dates are UTC midnight (see fromDateInput). */
function toDateInput(date: Date | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** A date input's `yyyy-mm-dd`, parsed as UTC midnight, or undefined when empty. */
function fromDateInput(value: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

function toYesNo(value: boolean | undefined): string {
  if (value === undefined) return "";
  return value ? "Ja" : "Nee";
}

function fromYesNo(value: string): boolean | undefined {
  if (value === "Ja") return true;
  if (value === "Nee") return false;
  return undefined;
}

/** A message for a list that failed to load, in the dashboard's language. */
function loadErrorMessage(error: unknown): string {
  if (error instanceof HttpError && error.status === 401)
    return "Sessie verlopen, log opnieuw in.";
  return "Bestellingen laden mislukt.";
}
