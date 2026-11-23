import { Button } from "./Button";
import styles from "./Pagination.module.css";

type Props = {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

/** "Vorige", "Pagina x van y", "Volgende". Renders nothing when there's one page. */
export default function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  className,
}: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav
      className={[styles.pagination, className].filter(Boolean).join(" ")}
      aria-label="Pagina's"
    >
      <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>
        Vorige
      </Button>
      <span>
        Pagina {page} van {totalPages}
      </span>
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Volgende
      </Button>
    </nav>
  );
}
