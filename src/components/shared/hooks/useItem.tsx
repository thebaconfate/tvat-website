import { useCallback, useMemo, useRef, useState } from "react";
import type { ZodType } from "zod/v4";

type Props<T> = {
  id: number | string;
  baseUrl: string;
  schema: ZodType<T>;
  init?: T;
};
export function useItem<Item>({ id, init, baseUrl, schema }: Props<Item>) {
  const url = useMemo(() => `${baseUrl}/${id}`, [baseUrl, id]);
  const [item, setItem] = useState(init);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>();
  const firstRenderSkipped = useRef(false);

  const PUT = useCallback(
    async (newItem: Item) => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetch(baseUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (!response.ok) throw new Error(`PUT failed: ${response.status}`);
        const data = await response.json();
        const put = schema.parse(data);
        setItem(put);
        return put;
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  const PATCH = useCallback(
    async (id: number, partial: Partial<Item>) => {
      setLoading(true);
      setError(undefined);
      try {
        const response = await fetch(`${baseUrl}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(partial),
        });
        if (!response.ok) throw new Error(`PATCH failed: ${response.status}`);
        const data = await response.json();
        const patched = schema.parse(data);
        setItem(patched);
        return patched;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [url],
  );

  const GET = useCallback(async () => {
    if (item) return item;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(url, { method: "GET" });
      if (!response.ok) throw new Error(`GET failed: ${response.status}`);
      const data = await response.json();
      const get = schema.parse(data);
      setItem(get);
      return get;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [url]);

  const DELETE = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`DELETE failed: ${response.status}`);
      return;
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [url]);

  if (init == undefined && !firstRenderSkipped.current) {
    firstRenderSkipped.current = true;
    GET();
  }

  return { item, loading, error, GET, PUT, PATCH, DELETE };
}
