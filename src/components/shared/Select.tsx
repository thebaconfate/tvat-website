import type { SelectHTMLAttributes } from "react";
import { cx } from "./cx";
import control from "./FormControl.module.css";
import styles from "./Select.module.css";
type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};
type Props = {
  options: Option[];
  placeholder?: string;
};

type SelectProps = Props & SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({
  options,
  placeholder,
  className,
  ...rest
}: SelectProps) {
  return (
    <select
      className={cx(control.control, styles.select, className)}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}
