import type z4 from "zod/v4";
import type { priceSchema } from "./price.schema";

export type PriceData = z4.infer<typeof priceSchema>;
