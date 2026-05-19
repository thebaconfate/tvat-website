import z4 from "zod/v4";

export const pickupLocationSchema = z4.object({
  id: z4.int(),
  name: z4.string(),
});
