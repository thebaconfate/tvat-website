import z from "zod/v4";
import { dateSchema } from "./date.schema";
export type DateData = z.infer<typeof dateSchema>;
