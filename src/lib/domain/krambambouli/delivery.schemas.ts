import z4 from "zod/v4";
import { priceSchema } from "../price";

export const deliveryZoneSchema = z4.object({
  id: z4.int(),
  name: z4.string(),
  postalCodeFrom: z4.int(),
  postalCodeTo: z4.int(),
  price: priceSchema,
});
