import { HttpError } from "@/lib/utils";
import type { z, ZodType } from "zod/v4";

export { HttpError };

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** A value that can go into a query string. `undefined`, `null` and "" are left out. */
type QueryValue = string | number | boolean | Date | null | undefined;
export type QueryParams = Record<string, QueryValue>;

type RequestOptions = {
  /** Sent as JSON. */
  body?: unknown;
  /** Appended to the url as a query string. */
  query?: QueryParams;
  signal?: AbortSignal;
};

/** `?a=1&b=true` for the given params, or "" when there are none to send. */
export function toQueryString(query: QueryParams = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(
      key,
      value instanceof Date ? value.toISOString() : String(value),
    );
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

/** Sends the request and returns the response; throws an `HttpError` unless it's 2xx. */
export async function request(
  method: Method,
  url: string,
  { body, query, signal }: RequestOptions = {},
): Promise<Response> {
  const response = await fetch(`${url}${toQueryString(query)}`, {
    method,
    signal,
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });
  if (!response.ok) throw new HttpError(method, url, response.status);
  return response;
}

/**
 * Sends the request and parses the JSON response with `schema`, so the result is
 * both validated and typed. Throws an `HttpError` unless it's 2xx, or a `ZodError`
 * when the response doesn't match the schema.
 */
export async function requestJson<Schema extends ZodType>(
  method: Method,
  url: string,
  schema: Schema,
  options?: RequestOptions,
): Promise<z.output<Schema>> {
  const response = await request(method, url, options);
  return schema.parse(await response.json());
}
