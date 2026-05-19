export function formatDate(
  date: Date,
  locale: string,
  opts: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, opts).format(date);
}
