/** Joins the class names that are set, e.g. cx(styles.control, isOpen && styles.open, className). */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
