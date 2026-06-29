import { config } from "@/lib/config";
import { resend } from "@/lib/resend";
import { userService } from "@/lib/services/users";
import type { APIContext } from "astro";
import z4 from "zod/v4";
import * as crypto from "crypto";
import PasswordResetEmail from "@/components/email/PasswordResetEmail";

export async function POST({ request }: APIContext) {
  const rawData = await request.json();
  const validator = z4.object({
    email: z4.email(),
  });
  const data = validator.parse(rawData);
  const email = data.email;
  const user = await userService.getUserByEmail(email);
  if (user) {
    //TODO: implement this properly by sending the reset password link with the
    //token embedded into it as well as saving the hashed token in the
    //database along with it's expiration. Notify the user that the token is
    //valid for 10 minutes or till the expiration times.
    const plainToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("base64url");
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    resend.emails.send({
      from: `'t VAT <forgot-password-form${config.resend.domain}>`,
      to: `${user.email}`,
      subject: `CONTACT FORM SUBMISSION`,
      react: PasswordResetEmail(""),
    });
  }

  return new Response();
}
