import { z } from "zod/v4";
export const pageSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    page: z.object({
      size: z.int(),
      number: z.int(),
      totalElements: z.int(),
      totalPages: z.int(),
    }),
  });
