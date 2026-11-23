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

/**
 * The query for a list of any resource: the page number, counted from 1 (the
 * repository turns it into the 0-based SQL offset), and optionally the page size
 * (the repository applies its default when left out). Resources with filters extend
 * this with their own fields, e.g. `orderQuerySchema`. Coerces, so it can parse
 * a query string.
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).optional(),
});
