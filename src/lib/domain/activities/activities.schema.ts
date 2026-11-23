import z from "zod/v4";
import { listQuerySchema, pageSchema } from "../page/page.schema";

export const activitySchema = z.object({
  id: z.int(),
  name: z.string().min(1),
  occursAt: z.coerce.date(),
  location: z.object({
    name: z.string().nullable(),
    address: z.string().nullish(),
    url: z.url().nullish(),
  }),
  /** A page about the activity, usually its Facebook event. */
  facebook: z.url().nullish(),
});

export const activityPageSchema = pageSchema(activitySchema);

export const activityFilterSchema = z
  .object({
    name: z.string().nonempty(),
    location: z.string().nonempty(),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
  })
  .partial();

export const activityQuerySchema = listQuerySchema.extend(
  activityFilterSchema.shape,
);
