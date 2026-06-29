import { config } from "@/lib/config";
import { database } from "@/lib/database";
import PasswordResetEmail from "emails/PasswordResetEmail";
import { Resend } from "resend";

export const resend = new Resend(config.resend.apiKey);

class ResendService {
  private resend = resend;
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

  async handleContactForm() {}

  async sendPasswordResetLink(resetURL: URL, receiver: string) {
    return this.resend.emails.send({
      from: `'t VAT <no-reply@${config.resend.domain}>`,
      to: `${receiver}`,
      subject: `PASSWORD RESET`,
      react: PasswordResetEmail({ resetURL: resetURL.toString() }),
    });
  }
}

export const resendService = new ResendService();
