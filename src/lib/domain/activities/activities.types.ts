import z from "zod/v4";
import type { activityPageSchema, activitySchema } from "./activities.schema";

export type ActivityData = z.infer<typeof activitySchema>;
export type ActivityPageData = z.infer<typeof activityPageSchema>;
