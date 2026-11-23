import { HttpError } from "@/lib/utils";
import type { z, ZodType } from "zod/v4";

export { HttpError };

export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | Date | null | undefined;
export type QueryParams = Record<string, QueryValue>;

type RequestOptions = {
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
};

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

export async function requestJson<Schema extends ZodType>(
  method: Method,
  url: string,
  schema: Schema,
  options?: RequestOptions,
): Promise<z.output<Schema>> {
  const response = await request(method, url, options);
  return schema.parse(await response.json());
}
