import { z } from "zod/v4";
import {
  newUserSchema,
  userSchema,
  UserService,
  type NewUserData,
} from "../users";
const credentialsSchema = z.object({
  ...userSchema.pick({ email: true }).shape,
  ...newUserSchema.pick({ password: true }).shape,
});
type Credentials = z.infer<typeof credentialsSchema>;
function two() {
  console.log("foo");
}

function one() {
  console.log("bar");
}
export class AuthService {
  private userService = new UserService();

  async register(newUser: NewUserData) {}
  async login(credentials: Credentials) {}
}
