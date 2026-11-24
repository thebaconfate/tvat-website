import {
  cloneElement,
  useId,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "./cx";
import styles from "./Field.module.css";

type FieldProps = {
  label: ReactNode;
  /** Shown under the control; also marks it invalid (red border, aria-invalid). */
  error?: ReactNode;
  /** Help text under the control, e.g. "Minstens 8 tekens". */
  hint?: ReactNode;
  className?: string;
  /** One control: Input, Select or Textarea. */
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean | "true" | "false";
  }>;
};

/**
 * A label, one control and its error text. Gives the control an id (or uses its own)
 * and links the label, hint and error to it, so screen readers announce them together.
 */
export default function Field({
  label,
  error,
  hint,
  className,
  children,
}: FieldProps) {
  const generatedId = useId();
  const id = children.props.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {cloneElement(children, {
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
