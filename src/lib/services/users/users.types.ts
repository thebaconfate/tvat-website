import { z } from "zod/v4";
import { newUserSchema, userSchema } from "./users.schema";

export type UserData = z.infer<typeof userSchema>;
export type NewUserData = z.infer<typeof newUserSchema>;
export type UserDataWithPassword = z.infer<typeof userSchema> & {
  password: string;
};
