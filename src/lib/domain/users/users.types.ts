import type z4 from "zod/v4";
import type { newUserSchema, userSchema } from "./users.schema";

export type UserData = z4.infer<typeof userSchema>;
export type NewUserData = z4.infer<typeof newUserSchema>;
export type UserDataWithPassword = z4.infer<typeof userSchema> & {
  password: string;
};
