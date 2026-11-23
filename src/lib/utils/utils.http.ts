/** A request that got a response, but not a successful (2xx) one. */
export class HttpError extends Error {
  /** The HTTP status code of the response, e.g. 404. */
  public readonly status: number;

  constructor(method: string, url: string, status: number) {
    super(`${method} ${url} failed: ${status}`);
    this.name = this.constructor.name;
    this.status = status;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * A message for a failed request, in the dashboard's language: `byStatus` for
 * specific status codes, an expired session for 401, otherwise `fallback`.
 */
export function httpErrorMessage(
  error: unknown,
  fallback: string,
  byStatus: Record<number, string> = {},
): string {
  if (!(error instanceof HttpError)) return fallback;
  if (byStatus[error.status]) return byStatus[error.status];
  if (error.status === 401) return "Sessie verlopen, log opnieuw in.";
  return fallback;
}
