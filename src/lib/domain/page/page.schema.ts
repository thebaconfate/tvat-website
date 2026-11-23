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

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).optional(),
});
