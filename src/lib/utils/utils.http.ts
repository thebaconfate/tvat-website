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
