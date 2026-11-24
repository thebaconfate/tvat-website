import type { TextareaHTMLAttributes } from "react";
import { cx } from "./cx";
import control from "./FormControl.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({ className, ...props }: TextareaProps) {
  return <textarea {...props} className={cx(control.control, className)} />;
}
