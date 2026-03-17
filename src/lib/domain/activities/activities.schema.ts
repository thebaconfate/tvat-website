import z from "zod/v4";
import { pageSchema } from "../page/page.schema";

export const activitySchema = z.object({
  name: z.string().min(3),
  date: z.iso.date(),
  time: z.iso.time(),
  location: z.object({
    name: z.string(),
    address: z.string().nullish(),
    url: z.url().nullish(),
  }),
  facebook: z.url().nullish(),
});

export const activityPageSchema = pageSchema(activitySchema);
