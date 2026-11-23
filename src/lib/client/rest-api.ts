import { pageSchema, type ListQuery } from "@/lib/domain/page";
import type { z, ZodType } from "zod/v4";
import type { CollectionApi, Identifiable } from "./client.types";
import { request, requestJson, type QueryParams } from "./http";

type RestApiConfig<
  ItemSchema extends ZodType<Identifiable>,
  PatchSchema extends ZodType,
  QuerySchema extends ZodType<ListQuery>,
> = {
  /** The list url; one item lives at `${url}/${id}`. */
  url: string;
  /** Parses every item in a response. */
  itemSchema: ItemSchema;
  /** Parses a patch before it's sent, so an invalid one fails before the request. */
  patchSchema: PatchSchema;
  /**
   * Gives `list` its query type. Not used to parse: the query is already typed, and
   * this schema parses query *strings*, which the endpoint does on the server.
   */
  querySchema: QuerySchema;
};

/**
 * A `CollectionApi` for an endpoint that follows the REST convention:
 * `GET url` (a page), `PATCH url/:id` and `DELETE url/:id`. The types come from
 * the schemas. Write the API object by hand for endpoints that don't fit.
 */
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
