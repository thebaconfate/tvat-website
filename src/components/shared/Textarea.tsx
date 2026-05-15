import styles from "./Textarea.module.css";
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export default function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={[styles.textarea, className].join(" ")}
      {...props}
    ></textarea>
  );
}
