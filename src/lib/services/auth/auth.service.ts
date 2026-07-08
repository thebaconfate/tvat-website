import crypto, { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { userService } from "../users";
import {
  tokenPayloadSchema,
  type Credentials,
  type JwtPayload,
} from "@/lib/domain/auth";
import { getAuthToken, hashPassword, verifyPassword } from "./auth.utils";
import { database } from "@/lib/database";
import { resendService } from "../resend/resend.service";
import { ROUTES } from "@/lib/routes";
import { InvalidTokenError } from "./auth.errors";

class AuthService {
  private secretKey = crypto.randomBytes(64).toString("hex");

  private userService = userService;

  private generateToken(payload: any) {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: "1h",
    });
  }
  verifyToken(token: string): JwtPayload | false {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      if (typeof decoded === "string")
        throw Error("Payload was a string. Something went wrong");
      const parsed = tokenPayloadSchema.parse(decoded);
      return parsed;
    } catch (err) {
      return false;
    }
  }

  async login(credentials: Credentials) {
    const user = await this.userService.getUserByEmail(credentials.email);
    if (!user) return null;
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

  async forgotPassword(email: string, siteOrigin: string) {
    // NOTE: The removal of expired tokens must be a separate query, otherwise
    // this method becomes vulnerable to timing attacks. An attacker can figure
    // out which email exists by timing the response time of the combined query.
    // By using two separate queries the response time is the baseline of the
    // heaviest query.
    const userPromise = this.userService.getUserByEmail(email);
    const deletePromises = Promise.all([
      database.query(
        `
        DELETE FROM password_recovery_tokens prt
        WHERE prt.user_id = (
            SELECT id FROM users WHERE email = $1
        )`,
        [email],
      ),
      database.query(
        `
        DELETE FROM password_recovery_tokens prt
        WHERE expires_at <= NOW()
      `,
      ),
    ]);
    const user = await userPromise;
    if (!user) {
      await deletePromises;
      return;
    }
    const token = randomBytes(32).toString("base64url");
    const hashedToken = createHash("sha256").update(token).digest("base64url");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
    const resetURL = new URL(ROUTES.RESET_PASSWORD.url, siteOrigin);
    resetURL.searchParams.append("token", token);
    try {
      await Promise.all([
        deletePromises,
        database.query(
          `
        INSERT INTO password_recovery_tokens (user_id, token_hash, created_at, expires_at) VALUES
        ($1, $2, $3, $4)
        `,
          [user.id, hashedToken, createdAt, expiresAt],
        ),
        resendService.sendPasswordResetLink(
          resetURL,
          user.email,
          user.firstName,
        ),
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  async resetPassword(password: string, token: string) {
    const hashedToken = createHash("sha256").update(token).digest("base64url");
    const hashedPassword = await hashPassword(password);
    const result = await database.query(
      `
      UPDATE users u
      SET password = $1
      FROM password_recovery_tokens prt
      WHERE u.id = prt.user_id
        AND prt.token_hash = $2
        AND prt.expires_at > NOW()
      RETURNING u.id
      `,
      [hashedPassword, hashedToken],
    );
    if (result.rowCount === 0) {
      throw new InvalidTokenError("This token is invalid or expired");
    }
    await database.query(
      `DELETE FROM password_recovery_tokens WHERE token_hash = $1`,
      [hashedToken],
    );
  }
}

export const authService = new AuthService();
