import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const SECRET_KEY = crypto.randomBytes(64).toString("hex");

export class Auth {
  bcrypt = bcrypt;
  saltRounds = 10;
  secretKey: string;

  constructor() {
    this.secretKey = SECRET_KEY;
  }

  async hash(plaintext: string) {
    return this.bcrypt.hash(plaintext, this.saltRounds);
  }

  async compare(plaintext: string, encrypted: string) {
    return this.bcrypt.compare(plaintext, encrypted);
  }

  async generateToken(email: string) {
    const payload = { email: email };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: "1h" });
    return token;
  }

  async requestPassage(request: Request) {
    const token = await this.getTokenFromRequest(request);
    if (!token) return false;
    const auth = new Auth();
    const validToken = await auth.verifyToken(token);
    return validToken;
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      return decoded;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }
  async getTokenFromRequest(request: Request) {
    const cookie: string[] | undefined = request.headers
      .get("cookie")
      ?.split("; ");
    const token: string | undefined = cookie
      ?.find((cookie) => cookie.startsWith("Authorization="))
      ?.split("=")[1];
    return token;
  }
}
