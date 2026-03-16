import z from "zod/v4";
import { roleSchema } from "./role.schema";

export const userSchema = z.object({
  id: z.int().nonnegative(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string().nullish(),
  role: roleSchema,
});

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters in length")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const newUserSchema = userSchema
  .omit({ id: true })
  .extend({ password: passwordSchema });
