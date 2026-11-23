import type { OrderData, OrderPatch } from "@/lib/domain/krambambouli";
import styles from "./KrambambouliOrderItem.module.css";
import { useMemo, useOptimistic, useState, useTransition } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/domain/datetime";
import { formatCurrency, httpErrorMessage } from "@/lib/utils";

type Props = {
  order: OrderData;
  locale: string;
  index: number;
  onUpdate: (patch: OrderPatch) => Promise<unknown>;
};

export default function KrambambouliOrderItem({
  order: savedOrder,
  locale,
  index,
  onUpdate,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<unknown>();
  const [saving, startSaving] = useTransition();
  const [order, applyPatch] = useOptimistic(
    savedOrder,
    (current, patch: OrderPatch) => ({ ...current, ...patch }),
  );

  const updateOrder = (patch: OrderPatch) => {
    if (saving) return;
    setError(undefined);
    startSaving(async () => {
      applyPatch(patch);
      try {
        await onUpdate(patch);
      } catch (e) {
        setError(e);
      }
    });
  };
  const isEven = useMemo(() => index % 2 === 0, [index]);
  const rowClass = `${styles.tr} ${isEven ? styles.even : ""}`;
  const detailRowClass = `${styles.detailRow} ${expanded ? styles.open : ""} ${isEven ? styles.even : ""}`;

  return (
    <>
      <tr className={rowClass}>
        <td
          className={`${styles.td} ${styles.clickable}`}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </td>
        <td className={styles.td}>{order.orderNumber}</td>
        <td className={styles.td}>
          {formatDate(new Date(order.createdAt), locale, {})}
        </td>
        <td className={`${styles.td} ${styles.name}`}>
          {`${order.firstName} ${order.lastName}`}
        </td>
        <td className={styles.td}>{formatCurrency(order.totalOwed / 100)}</td>
        <td className={styles.td}>
          <StatusCheckbox
            label="Ontvangen"
            checked={order.received}
            onChange={(received) => updateOrder({ received })}
          />
        </td>
        <td className={styles.td}>
          <StatusCheckbox
            label="Betaald"
            checked={order.paid}
            onChange={(paid) => updateOrder({ paid })}
          />
        </td>
      </tr>

      {error != null && (
        <tr className={rowClass}>
          <td colSpan={7} className={styles.errorCell} role="alert">
            {httpErrorMessage(error, "Opslaan mislukt, probeer het opnieuw.", {
              404: "Deze bestelling bestaat niet meer.",
            })}
          </td>
        </tr>
      )}

      {/* Expandable Details Drawer */}
      <tr className={detailRowClass}>
        <td colSpan={7} className={styles.detailCell}>
          <div className={styles.detailContent}>
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Klant details</h4>
              <p>
                <strong>Email:</strong> {order.email}
              </p>
              <p>
                <strong>Levering:</strong>{" "}
                {order.deliveryOption === "pickup"
                  ? `Afhalen (${order.pickupLocationName ?? "Onbekend"})`
                  : "Levering aan huis"}
              </p>
              {order.deliveryOption === "delivery" && (
                <p>
                  <strong>Adres:</strong> {order.streetName} {order.houseNumber}
                  {order.bus ? ` bus ${order.bus}` : ""}, {order.postalCode}{" "}
                  {order.city}
                </p>
              )}
            </div>

            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Bestelde artikelen</h4>
              {order.orders && order.orders.length > 0 ? (
                <ul className={styles.productList}>
                  {order.orders.map((item, idx) => (
                    <li key={idx} className={styles.productListItem}>
                      <span>
                        {item.amount}x {item.productName}
                      </span>
                      <span>
                        {formatCurrency((item.price * item.amount) / 100)}
                      </span>
                    </li>
                  ))}
                  <li className={styles.productListItem}>
                    <span>Totaal</span>{" "}
                    <span>
                      {formatCurrency(
                        order.orders.reduce(
                          (acc, order) => acc + order.price * order.amount,
                          0,
                        ) / 100,
                      )}
                    </span>
                  </li>
                </ul>
              ) : (
                <p>Geen producten gevonden.</p>
              )}
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

type StatusCheckboxProps = {
  /** What the status means, e.g. "Betaald". Announced by screen readers. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function StatusCheckbox({ label, checked, onChange }: StatusCheckboxProps) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  );
}
