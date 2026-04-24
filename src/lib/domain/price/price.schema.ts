import z4 from "zod/v4";

export const priceSchema = z4.object({
  euros: z4.int(),
  cents: z4.int(),
});
