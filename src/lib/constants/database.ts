import dotenv from "dotenv";
import type { ConnectionOptions } from "mysql2/promise";

dotenv.config();

export const Tables = Object.freeze({
  PRODUCTS: "products",
  PICKUP_LOCATIONS: "pickup_locations",
  DELIVERY_LOCATIONS: "delivery_locations",
  LOCATION_CODES: "location_codes",
  ACTIVITIES: "activities",
  KRAMBAMBOULI_CUSTOMERS: "krambambouli_customers",
  KRAMBAMBOULI_DELIVERY_ADDRESS: "krambambouli_delivery_addresses",
  KRAMBAMBOULI_PICK_UP_LOCATION: "krambambouli_pickup_locations",
  KRAMBAMBOULI_ORDERS: "krambambouli_orders",
  USERS: "users",
});

function getEnv(key: string, defaultValue: string | undefined = undefined) {
  const value = process.env[key];
  if (value) return value;
  else if (!value && defaultValue) return defaultValue;
  else throw Error(`Missing env variable: ${key}`);
}

export type Tables = typeof Tables;

export const DatabaseConfig: ConnectionOptions = Object.freeze({
  host: getEnv("DB_HOST"),
  port: parseInt(getEnv("DB_PORT")),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD"),
  database: getEnv("DB_DATABASE"),
  connectionLimit: 10,
});

export type DatabaseConfig = typeof DatabaseConfig;

export const Database = Object.freeze({
  TABLES: Tables,
  CONFIG: DatabaseConfig,
  RETRIES: parseInt(getEnv("DB_RETRIES", "10")),
});

export type Database = typeof Database;
