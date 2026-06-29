import { config } from "@/lib/config";
import { database } from "@/lib/database";
import PasswordResetEmail from "emails/PasswordResetEmail";
import { Resend } from "resend";

class ResendService {
  private resend = new Resend(config.resend.apiKey);
  async enqueue(jobType: string, payload: any, recipient: string) {
    const sql = `
    INSERT INTO email_jobs (job_type, payload, recipient)
    values ($1, $2, $3)
    RETURNING *
    `;
    const result = await database.query(sql, [jobType, payload, recipient]);
    const [row] = result.rows;
    return row ?? null;
  }

  async sendPasswordResetLink(token: string, receiver: string) {
    await this.resend.emails.send({
      from: `'t VAT <forgot-password-form${config.resend.domain}>`,
      to: `${receiver}`,
      subject: `CONTACT FORM SUBMISSION`,
      react: PasswordResetEmail(token),
    });
  }
}

export const resendService = new ResendService();
