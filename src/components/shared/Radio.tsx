import type { InputHTMLAttributes, ReactNode } from "react";
import styles from "./Choice.module.css";
import { cx } from "./cx";

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

export default function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className={cx(styles.choice, className)}>
      <input {...props} type="radio" className={styles.input} />
      <span>{label}</span>
    </label>
  );
}
