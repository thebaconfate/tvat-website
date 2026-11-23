import { pageSchema, type ListQuery } from "@/lib/domain/page";
import type { z, ZodType } from "zod/v4";
import type { CollectionApi, Identifiable, ListApi } from "./client.types";
import { request, requestJson, type QueryParams } from "./http";

type ListApiConfig<
  ItemSchema extends ZodType<Identifiable>,
  QuerySchema extends ZodType<ListQuery>,
> = {
  url: string;
  itemSchema: ItemSchema;
  querySchema: QuerySchema;
};

type RestApiConfig<
  ItemSchema extends ZodType<Identifiable>,
  PatchSchema extends ZodType,
  QuerySchema extends ZodType<ListQuery>,
> = ListApiConfig<ItemSchema, QuerySchema> & {
  patchSchema: PatchSchema;
};

/** A `ListApi` for `GET url`, which returns a page. */
export function createListApi<
  ItemSchema extends ZodType<Identifiable>,
  QuerySchema extends ZodType<ListQuery>,
>({
  url,
  itemSchema,
}: ListApiConfig<ItemSchema, QuerySchema>): ListApi<
  z.output<ItemSchema>,
  z.output<QuerySchema>
> {
  const listSchema = pageSchema(itemSchema);
  return {
    list: (query, signal) =>
      requestJson("GET", url, listSchema, {
        query: query as QueryParams,
        signal,
      }),
  };
}

/** A `CollectionApi` for `GET url`, `PATCH url/:id` and `DELETE url/:id`. */
export function createRestApi<
  ItemSchema extends ZodType<Identifiable>,
  PatchSchema extends ZodType,
  QuerySchema extends ZodType<ListQuery>,
>(
  config: RestApiConfig<ItemSchema, PatchSchema, QuerySchema>,
): CollectionApi<
  z.output<ItemSchema>,
  z.output<PatchSchema>,
  z.output<QuerySchema>
> {
  const { url, itemSchema, patchSchema } = config;
  type Item = z.output<ItemSchema>;
  const itemUrl = (id: Item["id"]) => `${url}/${encodeURIComponent(id)}`;

  return {
    ...createListApi(config),
    update: (id, patch) =>
      requestJson("PATCH", itemUrl(id), itemSchema, {
        body: patchSchema.parse(patch),
      }),
    remove: async (id) => {
      await request("DELETE", itemUrl(id));
    },
  };
}
