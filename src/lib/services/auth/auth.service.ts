import { z } from "zod/v4";
import { roleSchema, userService, type NewUserData } from "../users";
import { getAuthToken, verifyPassword } from "./auth.utils";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { Credentials } from "./auth.types";

class AuthService {
  private secretKey = crypto.randomBytes(64).toString("hex");

  private userService = userService;

  async register(newUser: NewUserData) {}

  private generateToken(payload: any) {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: "1h",
    });
  }
  private verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      if (typeof decoded === "string")
        throw Error("Payload was a string. Something went wrong");
      const schema = z.object({
        sub: z.int().nonnegative(),
        role: roleSchema,
      });
      const parsed = schema.parse(decoded);
      return parsed;
    } catch (err) {
      return false;
    }
  }

  async login(credentials: Credentials) {
    const user = await this.userService.getUserByEmail(credentials.email);
    const verified = await verifyPassword(credentials.password, user.password);
    if (!verified) return null;
    const payload = { sub: user.id, role: user.role };
    return this.generateToken(payload);
  }

  async authenticate(headers: Headers) {
    const token = getAuthToken(headers);
    if (!token) return false;
    return this.verifyToken(token);
  }
}

export const authService = new AuthService();
