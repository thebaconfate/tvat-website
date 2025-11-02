import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "At least 6 characters are required"),
});

export type LoginData = z.infer<typeof loginSchema>;
