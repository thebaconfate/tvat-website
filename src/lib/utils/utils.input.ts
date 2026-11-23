/** A number from an input, or undefined when it's empty or not a number. */
export function toNumber(value: string): number | undefined {
  const number = parseFloat(value);
  return Number.isNaN(number) ? undefined : number;
}

/** `yyyy-mm-dd` for a date input. Filter dates are UTC midnight (see fromDateInput). */
export function toDateInput(date: Date | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** A date input's `yyyy-mm-dd`, parsed as UTC midnight, or undefined when empty. */
export function fromDateInput(value: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

/** Options for a Ja/Nee select; pair with `toYesNo` and `fromYesNo`. */
export const yesNoOptions = [
  { label: "Ja", value: "Ja" },
  { label: "Nee", value: "Nee" },
];

export function toYesNo(value: boolean | undefined): string {
  if (value === undefined) return "";
  return value ? "Ja" : "Nee";
}

export function fromYesNo(value: string): boolean | undefined {
  if (value === "Ja") return true;
  if (value === "Nee") return false;
  return undefined;
}
