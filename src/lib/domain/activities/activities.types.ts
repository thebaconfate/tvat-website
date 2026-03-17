import z from "zod/v4";
import type { activitySchema } from "./activities.schema";

export type ActivityData = z.infer<typeof activitySchema>;
