import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Choice.module.css";
import { cx } from "./cx";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  /** Keep the label for screen readers only, e.g. for a checkbox in a table cell. */
  hideLabel?: boolean;
};

export default function Checkbox({
  label,
  hideLabel = false,
  className,
  ...props
}: CheckboxProps) {
  return (
    <label className={cx(styles.choice, className)}>
      <input {...props} type="checkbox" className={styles.input} />
      <span className={hideLabel ? styles.visuallyHidden : undefined}>
        {label}
      </span>
    </label>
  );
}
