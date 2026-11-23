import z from "zod/v4";
import type {
  activityFilterSchema,
  activityPageSchema,
  activityQuerySchema,
  activitySchema,
} from "./activities.schema";

export type ActivityData = z.infer<typeof activitySchema>;
export type ActivityPageData = z.infer<typeof activityPageSchema>;
export type ActivityFilters = z.infer<typeof activityFilterSchema>;
export type ActivityQuery = z.infer<typeof activityQuerySchema>;
