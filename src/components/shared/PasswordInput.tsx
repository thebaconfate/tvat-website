import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeClosed } from "lucide-react";
import Input from "./Input";
import styles from "./PasswordInput.module.css";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/** A password field with a button inside it that shows or hides the password. */
export default function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? Eye : EyeClosed;
  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Verberg wachtwoord" : "Toon wachtwoord"}
          aria-pressed={visible}
        >
          <Icon aria-hidden="true" className={styles.icon} />
        </button>
      }
    />
  );
}
