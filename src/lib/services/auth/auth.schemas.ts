import z from "zod/v4";
import { newUserSchema, userSchema } from "../users";

export const credentialsSchema = z.object({
  ...userSchema.pick({ email: true }).shape,
  ...newUserSchema.pick({ password: true }).shape,
});
