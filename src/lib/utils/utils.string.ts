export function capitalize(str: string, locale?: string) {
  if (!str) return str;
  return str[0].toLocaleUpperCase(locale) + str.slice(1);
}
