import z from "zod/v4";
import { roleSchema } from "./role.schema";

export const userSchema = z.object({
  id: z.int().nonnegative(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string().nullish(),
  role: roleSchema,
});

export const newUserSchema = userSchema
  .omit({ id: true })
  .extend({ password: z.string() });
