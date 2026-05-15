import styles from "./Input.module.css";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className, ...props }: InputProps) {
  return <input {...props} className={[styles.input, className].join(" ")} />;
}
