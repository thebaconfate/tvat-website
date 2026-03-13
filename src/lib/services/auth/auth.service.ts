import { z } from "zod/v4";
import {
  newUserSchema,
  userSchema,
  userService,
  type NewUserData,
} from "../users";
import { verifyPassword } from "./auth.utils";

const credentialsSchema = z.object({
  ...userSchema.pick({ email: true }).shape,
  ...newUserSchema.pick({ password: true }).shape,
});

type Credentials = z.infer<typeof credentialsSchema>;

class AuthService {
  private userService = userService;

  async register(newUser: NewUserData) {}
  async login(credentials: Credentials) {
    const user = await this.userService.getUserByEmail(credentials.email);
    const verified = await verifyPassword(credentials.password, user.password);
    if (verified) {
      // TODO: implement this
    }
    throw Error("Wrong password");
  }
}

export const authService = new AuthService();
