import type z4 from "zod/v4";
import type { krambambouliProductSchema } from "./krambambouli.schemas";

export type KrambambouliProductData = z4.infer<
  typeof krambambouliProductSchema
>;
