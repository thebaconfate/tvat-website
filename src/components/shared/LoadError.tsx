import { Button } from "./Button";
import styles from "./LoadError.module.css";

type Props = {
  message: string;
  onRetry: () => void;
  className?: string;
};

/** A failed load's message with an "Opnieuw proberen" button. */
export default function LoadError({ message, onRetry, className }: Props) {
  return (
    <p
      className={[styles.error, className].filter(Boolean).join(" ")}
      role="alert"
    >
      {message}{" "}
      <Button variant="secondary" onClick={onRetry}>
        Opnieuw proberen
      </Button>
    </p>
  );
}
