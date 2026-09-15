import { config } from "@/lib/config";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import { database } from "@/lib/infrastructure/database";
import OrderConfirmationEmail from "emails/OrderConfirmationEmail";
import PasswordResetEmail from "emails/PasswordResetEmail";
import { Resend } from "resend";

export const resend = new Resend(config.resend.apiKey);

class MailService {
  private readonly resend = resend;
  private readonly domain = `'t VAT <no-reply@${config.resend.domain}>`;
  private readonly paymentConfig = config.payment;

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

  //TODO: Implement this; move existing logic to here
  async handleContactForm() {}

  async sendPasswordResetLink(
    resetURL: URL,
    receiver: string,
    firstName: string,
  ) {
    return this.resend.emails.send({
      from: this.domain,
      to: `${receiver}`,
      subject: `Password reset`,
      react: PasswordResetEmail({ resetURL: resetURL.toString(), firstName }),
    });
  }

  async sendOrderConfirmation(order: OrderData) {
    return this.resend.emails.send({
      from: this.domain,
      to: order.email,
      subject: "Krambambouli bestelling",
      react: OrderConfirmationEmail({
        order: order,
        iban: this.paymentConfig.iban,
        bic: this.paymentConfig.bic,
        accountHolder: this.paymentConfig.accountHolder,
      }),
    });
  }
}

export const mailService = new MailService();
