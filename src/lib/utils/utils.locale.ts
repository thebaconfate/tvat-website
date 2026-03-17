export function getLocale(request: Request) {
  return request.headers.get("accept-language")?.split(",")[0] ?? "nl-BE";
}
