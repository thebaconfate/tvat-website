import z from "zod/v4";
import { newUserSchema, roleSchema, userSchema } from "../users";

export const credentialsSchema = z.object({
  ...userSchema.pick({ email: true }).shape,
  ...newUserSchema.pick({ password: true }).shape,
});

export const tokenPayloadSchema = z.object({
  sub: z.int().nonnegative(),
  role: roleSchema,
});
