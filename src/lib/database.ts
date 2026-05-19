import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { config } from "./config";

const RETRYABLE_ERRORS = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EPIPE",
  "57P01", // PostgreSQL: admin shutdown
  "08006", // PostgreSQL: connection failure
  "08001", // PostgreSQL: unable to connect
  "08004", // PostgreSQL: rejected connection
]);

function isRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const pgError = error as Error & { code?: string };
  console.log(`Error: ${pgError}`);
  return (
    RETRYABLE_ERRORS.has(pgError.code ?? "") ||
    RETRYABLE_ERRORS.has((pgError as NodeJS.ErrnoException).code ?? "")
  );
}

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = 5,
  delayMs = 500,
  backoffMultiplier = 2,
) {
  try {
    return operation();
  } catch (error) {
    console.error(error);
    if (retries <= 0 || !isRetryable(error)) throw error;
    console.log("Retrying operation");
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(operation, retries - 1, delayMs * backoffMultiplier);
  }
}

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      ...config.database,
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });

    this.pool.on("error", (err) => {
      console.error("Idle pool client error:", err.message);
    });
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    return withRetry(async () => await this.pool.query<T>(sql, params));
  }

  public async withTransaction<T extends QueryResultRow = QueryResultRow>(
    transaction: (client: PoolClient) => Promise<QueryResult<T> | void>,
  ): Promise<QueryResult<T> | void> {
    return withRetry(async () => {
      const client = await this.pool.connect();
      try {
        await client.query("BEGIN");
        const result = await transaction(client);
        await client.query("COMMIT");
        return result;
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      } finally {
        client.release();
      }
    });
  }
}

export const database = new Database();
