import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Choice.module.css";
import { cx } from "./cx";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

export default function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cx(styles.choice, className)}>
      <input {...props} type="checkbox" className={styles.input} />
      <span>{label}</span>
    </label>
  );
}
