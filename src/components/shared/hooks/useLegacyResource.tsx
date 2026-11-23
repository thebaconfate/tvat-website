import { useCallback, useEffect, useRef, useState } from "react";
import { HttpError } from "@/lib/utils";
import type { ZodType } from "zod/v4";

type Props<T> = {
  id: number | string;
  baseUrl: string;
  schema: ZodType<T>;
  init?: T;
};

type Method = "GET" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  /** Sent as JSON. */
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * One item on the server at `${baseUrl}/${id}`: loads, replaces, updates and removes it.
 * Being replaced by `useResource` + `useCollection`; remove once nothing uses it.
 */
export function useLegacyResource<Item>({
  id,
  init,
  baseUrl,
  schema,
}: Props<Item>) {
  const url = `${baseUrl}/${id}`;
  const [item, setItem] = useState(init);
  const [prevInit, setPrevInit] = useState(init);
  // useState ignores `init` after the first render, so adopt a newer `init` from the
  // parent here (e.g. after a list refetch). Setting state during render is fine for
  // this pattern: React re-renders straight away, before showing the stale item.
  // `init` is compared by reference: a parent must not create a new object every render.
  if (init !== prevInit) {
    setPrevInit(init);
    if (init !== undefined) setItem(init);
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();

  // Numbers the requests. Responses can arrive in a different order than their
  // requests were sent, so only the newest request may update `item`, `loading` and
  // `error`; otherwise an older, slower response could overwrite a newer item.
  const latestRequest = useRef(0);

  /**
   * Sends a request to the item's url and returns the item from the response;
   * a successful DELETE has none and clears `item`. Throws an `HttpError` for a non-2xx response.
   * Only the newest request updates `item`, `loading` and `error`; older ones still
   * return their own result (or throw) to their caller. Once `signal` is aborted,
   * the result is ignored: no state is updated and nothing is thrown.
   */
  const request = useCallback(
    async (
      method: Method,
      { body, signal }: RequestOptions = {},
    ): Promise<Item | undefined> => {
      const requestId = ++latestRequest.current;
      const isLatest = () =>
        requestId === latestRequest.current && !signal?.aborted;
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetch(url, {
          method,
          signal,
          ...(body !== undefined && {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
        });
        if (!response.ok) throw new HttpError(method, url, response.status);
        if (method === "DELETE") {
          // The item no longer exists on the server, so stop showing it.
          if (isLatest()) setItem(undefined);
          return;
        }
        const result = schema.parse(await response.json());
        if (isLatest()) setItem(result);
        return result;
      } catch (e) {
        if (signal?.aborted) return;
        if (isLatest()) setError(e);
        throw e;
      } finally {
        if (isLatest()) setLoading(false);
      }
    },
    [url, schema],
  );

  // Every method below throws when its request fails, and also stores the error in
  // `error` for rendering. Callers that only render `error` can ignore the rejection
  // with `.catch(() => undefined)`.

  /** Replaces the whole item. */
  const replace = useCallback(
    (newItem: Item) => request("PUT", { body: newItem }),
    [request],
  );

  /** Changes the given fields of the item. */
  const update = useCallback(
    (partial: Partial<Item>) => request("PATCH", { body: partial }),
    [request],
  );

  /** Returns the item, fetching it only when it isn't loaded yet. */
  const load = useCallback(async () => item ?? request("GET"), [item, request]);

  /** Deletes the item on the server. */
  const remove = useCallback(async () => {
    await request("DELETE");
  }, [request]);

  // Without an initial item, load it after mounting. The cleanup cancels a request
  // that is still running when the component unmounts or the url changes (and the
  // first of the two runs React Strict Mode does in development).
  useEffect(() => {
    if (init !== undefined) return;
    const controller = new AbortController();
    // request stores errors in `error`; don't also surface them as unhandled rejections.
    request("GET", { signal: controller.signal }).catch(() => undefined);
    return () => controller.abort();
  }, [request]);

  return { item, loading, error, load, replace, update, remove };
}
