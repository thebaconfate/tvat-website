import z from "zod/v4";
import type { roleSchema } from "./role.schema";

export type Role = z.infer<typeof roleSchema>;
