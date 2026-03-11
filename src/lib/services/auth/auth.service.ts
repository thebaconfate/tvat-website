import { z } from "zod/v4";
import {
  newUserSchema,
  userSchema,
  userService,
  type NewUserData,
} from "../users";

const credentialsSchema = z.object({
  ...userSchema.pick({ email: true }).shape,
  ...newUserSchema.pick({ password: true }).shape,
});

type Credentials = z.infer<typeof credentialsSchema>;

class AuthService {
  private userService = userService;

  async register(newUser: NewUserData) {}
  async login(credentials: Credentials) {}
}

export const authService = new AuthService();
