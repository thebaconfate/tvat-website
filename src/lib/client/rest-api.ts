import { pageSchema, type ListQuery } from "@/lib/domain/page";
import type { z, ZodType } from "zod/v4";
import type { CollectionApi, Identifiable } from "./client.types";
import { request, requestJson, type QueryParams } from "./http";

type RestApiConfig<
  ItemSchema extends ZodType<Identifiable>,
  PatchSchema extends ZodType,
  QuerySchema extends ZodType<ListQuery>,
> = {
  url: string;
  itemSchema: ItemSchema;
  patchSchema: PatchSchema;
  querySchema: QuerySchema;
};

export function createRestApi<
  ItemSchema extends ZodType<Identifiable>,
  PatchSchema extends ZodType,
  QuerySchema extends ZodType<ListQuery>,
>({
  url,
  itemSchema,
  patchSchema,
}: RestApiConfig<ItemSchema, PatchSchema, QuerySchema>): CollectionApi<
  z.output<ItemSchema>,
  z.output<PatchSchema>,
  z.output<QuerySchema>
> {
  type Item = z.output<ItemSchema>;
  const itemUrl = (id: Item["id"]) => `${url}/${encodeURIComponent(id)}`;
  const listSchema = pageSchema(itemSchema);

  return {
    list: (query, signal) =>
      requestJson("GET", url, listSchema, {
        query: query as QueryParams,
        signal,
      }),
    update: (id, patch) =>
      requestJson("PATCH", itemUrl(id), itemSchema, {
        body: patchSchema.parse(patch),
      }),
    remove: async (id) => {
      await request("DELETE", itemUrl(id));
    },
  };
}
