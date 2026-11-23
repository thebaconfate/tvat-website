import type { CollectionApi, Identifiable } from "@/lib/client/client.types";
import type { ListQuery } from "@/lib/domain/page";
import { useCallback } from "react";
import { useList, type ListOptions } from "./useList";

/** A `useList` whose items can also be updated and removed. */
export function useCollection<
  Item extends Identifiable,
  Patch,
  Query extends ListQuery,
>(api: CollectionApi<Item, Patch, Query>, options?: ListOptions<Item, Query>) {
  const list = useList(api, options);
  const { mutate, refetch } = list;

  const updateItem = useCallback(
    async (id: Item["id"], patch: Patch) => {
      const updated = await api.update(id, patch);
      mutate((current) => ({
        ...current,
        content: current.content.map((item) =>
          item.id === id ? updated : item,
        ),
      }));
      return updated;
    },
    [api, mutate],
  );

  const removeItem = useCallback(
    async (id: Item["id"]) => {
      await api.remove(id);
      refetch();
    },
    [api, refetch],
  );

  return { ...list, updateItem, removeItem };
}
