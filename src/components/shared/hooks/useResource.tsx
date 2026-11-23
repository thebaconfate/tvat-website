import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";

/** Loads the data; must stop (reject) when `signal` is aborted. */
export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

function sameDeps(a: DependencyList, b: DependencyList) {
  return a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));
}

/**
 * Owns the data that one async request returns: an item, a page, anything.
 *
 * - Calls `fetcher` whenever `deps` change, and keeps showing the previous
 *   `data` while the new request runs (no flicker).
 * - Aborts the previous request when `deps` change or the component unmounts,
 *   and ignores whatever an aborted request returns, so an older, slower
 *   response can never overwrite newer data.
 * - With `initialData` (e.g. rendered on the server), skips fetching until the
 *   deps differ from the ones the initial data belongs to.
 * - `refetch()` loads again with the same deps; `mutate(fn)` changes `data`
 *   locally, e.g. to swap in an item returned by an update.
 */
export function useResource<T>(
  fetcher: Fetcher<T>,
  deps: DependencyList,
  initialData?: T,
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<unknown>();
  // Part of the effect's deps; bumping it makes the effect run (and fetch) again.
  const [version, setVersion] = useState(0);
  // The deps `initialData` belongs to. Compared instead of a "first run" flag,
  // because React Strict Mode runs effects twice in development.
  const initialDeps = useRef<DependencyList | null>(
    initialData === undefined ? null : deps,
  );

  useEffect(() => {
    if (initialDeps.current) {
      if (version === 0 && sameDeps(deps, initialDeps.current)) return;
      // From now on the data no longer matches the initial deps: always fetch.
      initialDeps.current = null;
    }

    const controller = new AbortController();
    const { signal } = controller;
    setLoading(true);
    setError(undefined);
    fetcher(signal)
      .then((result) => {
        if (!signal.aborted) setData(result);
      })
      .catch((e) => {
        if (!signal.aborted) setError(e);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // `deps` stand in for `fetcher`: callers pass whatever their fetcher reads.
  }, [...deps, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const mutate = useCallback((fn: (data: T) => T) => {
    setData((current) => (current === undefined ? current : fn(current)));
  }, []);

  return { data, loading, error, refetch, mutate };
}
