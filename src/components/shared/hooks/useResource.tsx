import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DependencyList,
} from "react";

export type Fetcher<T> = (signal: AbortSignal) => Promise<T>;

function sameDeps(a: DependencyList, b: DependencyList) {
  return a.length === b.length && a.every((dep, i) => Object.is(dep, b[i]));
}

export function useResource<T>(
  fetcher: Fetcher<T>,
  deps: DependencyList,
  initialData?: T,
) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(initialData === undefined);
  const [error, setError] = useState<unknown>();
  const [version, setVersion] = useState(0);
  const initialDeps = useRef<DependencyList | null>(
    initialData === undefined ? null : deps,
  );

  useEffect(() => {
    if (initialDeps.current) {
      if (version === 0 && sameDeps(deps, initialDeps.current)) return;
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
  }, [...deps, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  const mutate = useCallback((fn: (data: T) => T) => {
    setData((current) => (current === undefined ? current : fn(current)));
  }, []);

  return { data, loading, error, refetch, mutate };
}
