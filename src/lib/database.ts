import {
  Pool,
  type PoolConfig,
  type QueryResult,
  type QueryResultRow,
} from "pg";
import { config } from "./config";

class Database {
  private pool: Pool | null;
  private config: PoolConfig;
  constructor() {
    this.pool = null;
    this.config = config.database;
  }

  private async connect(retries = 5, delay = 2000): Promise<Pool> {
    if (this.pool) return this.pool;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.pool = new Pool(this.config);
        await this.pool.query("SELECT 1");
        console.log("Database connected");
        return this.pool;
      } catch (err: any) {
        console.warn(
          `Database connection failed (attempt ${attempt}): ${err.message}`,
        );
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, attempt * delay));
      }
    }
    throw new Error(
      `Failed to connect to the database after ${retries} retries`,
    );
  }

  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: any[],
    retries = 3,
    delay = 1000,
  ): Promise<QueryResult<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const pool = await this.connect();
        return pool.query<T>(text, params);
      } catch (err: any) {
        console.warn(`Query attempt ${attempt} failed: ${err.message}`);
        this.pool = null; // force reconnect next try
        if (attempt === retries) throw err;
        await new Promise((r) => setTimeout(r, (attempt - 1) * delay));
      }
    }
    throw new Error(`Query failed after ${retries} retries`);
  }
}

export const database = new Database();
