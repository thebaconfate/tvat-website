import z4 from "zod/v4";
import { priceSchema } from "../price/";

export const productSchema = z4.object({
  id: z4.int(),
  name: z4.string(),
  description: z4.string().optional(),
  imageUrl: z4.string(),
  price: priceSchema,
});
