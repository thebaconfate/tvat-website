import type { z } from "zod/v4";
import type { listQuerySchema } from "./page.schema";

export type Page<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

export type ListQuery = z.infer<typeof listQuerySchema>;
