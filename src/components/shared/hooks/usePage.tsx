import { useCallback, useState } from "react";

export function usePage(initialPage = 1) {
  const [page, setPageState] = useState(initialPage);
  const setPage = useCallback(
    (page: number) => setPageState(Math.max(1, Math.floor(page))),
    [],
  );
  return { page, setPage };
}
