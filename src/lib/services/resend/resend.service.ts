import { database } from "@/lib/database";
import type { ContactFormType } from "@/lib/domain/contact";

class ResendService {
  async enqueue(
    emailType: string,
    payload: ContactFormType,
    recipient: string,
  ) {
    const sql = `
    INSERT INTO email_jobs (type, payload, recipient) values ($1, $2, $3)'
    `;
    database.query(sql, [emailType, payload, recipient]);
  }
}

export const resendService = new ResendService();
