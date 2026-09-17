export function formatCurrency(
  amount: number,
  locale: string = "nl-BE",
  currency: string = "EUR",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}
