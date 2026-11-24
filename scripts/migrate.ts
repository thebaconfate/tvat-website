// Applies the SQL files in migrations/ that the database doesn't have yet, in name order.
//
//   pnpm db:migrate
//
// Each database records the files it got in `schema_migrations`. A file runs in one
// transaction together with that record, so it is either fully applied and recorded,
// or not at all. Name new files `YYYY-MM-DD-what-it-does.sql`, so they sort by date,
// and never change a file once it has run anywhere: add a new one instead.
//
// Connects with DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_DATABASE, like the site.
// Runs on Node's built-in TypeScript support, so it may only use erasable syntax.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const MIGRATIONS_DIR = path.join(import.meta.dirname, "..", "migrations");
// Any fixed number: two runs at once (e.g. overlapping deploys) take turns.
const LOCK_ID = 7_202_611;

function env(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);
  return value;
}

async function migrate() {
  const client = new pg.Client({
    host: env("DB_HOST"),
    port: Number(env("DB_PORT")),
    user: env("DB_USER"),
    password: env("DB_PASSWORD"),
    database: env("DB_DATABASE"),
  });
  await client.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    const { rows } = await client.query<{ name: string }>(
      "SELECT name FROM schema_migrations",
    );
    const applied = new Set(rows.map((row) => row.name));
    const files = (await readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();
    const pending = files.filter((file) => !applied.has(file));

    if (pending.length === 0) {
      console.log(`Database is up to date (${files.length} migrations).`);
      return;
    }
    for (const file of pending) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`Applying ${file} ...`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`${file} failed; nothing from it was applied`, {
          cause: error,
        });
      }
    }
    console.log(`Applied ${pending.length} migration(s).`);
  } finally {
    await client.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
