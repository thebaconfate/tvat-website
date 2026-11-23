import { useCallback, useState } from "react";

/**
 * The current page number, counted from 1. Only the client-side state: how many
 * pages there are comes from the server's data (see `useCollection`).
 */
export function usePage(initialPage = 1) {
  const [page, setPageState] = useState(initialPage);
  const setPage = useCallback(
    (page: number) => setPageState(Math.max(1, Math.floor(page))),
    [],
  );
  return { page, setPage };
}
