import { database } from "@/lib/database";

class ResendService {
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
}

export const resendService = new ResendService();
