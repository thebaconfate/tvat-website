import dotenv from "dotenv";
import type { PoolConfig } from "pg";

dotenv.config();

type Config = {
  database: PoolConfig;
};

export function getEnv(
  key: string,
  defaultValue: string | undefined = undefined,
) {
  const value = process.env[key];
  if (value) return value;
  else if (!value && defaultValue) return defaultValue;
  else throw Error(`Missing env variable: ${key}`);
}

export const config: Config = {
  database: {
    host: getEnv("DB_HOST"),
    port: parseInt(getEnv("DB_PORT")),
    user: getEnv("DB_USER"),
    password: getEnv("DB_PASSWORD"),
    database: getEnv("DB_DATABASE"),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  },
};
