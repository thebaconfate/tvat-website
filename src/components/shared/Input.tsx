import type { InputHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx";
import control from "./FormControl.module.css";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Shown inside the end of the field, e.g. a show/hide password button. */
  trailing?: ReactNode;
};

export default function Input({ className, trailing, ...props }: InputProps) {
  if (trailing === undefined)
    return <input {...props} className={cx(control.control, className)} />;
  return (
    <span className={styles.wrapper}>
      <input
        {...props}
        className={cx(control.control, styles.withTrailing, className)}
      />
      <span className={styles.trailing}>{trailing}</span>
    </span>
  );
}
