import type z4 from "zod/v4";
import type { productSchema } from "./products.schema";

export type ProductSchema = z4.infer<typeof productSchema>;
