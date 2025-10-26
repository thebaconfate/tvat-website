import dotenv from "dotenv";

dotenv.config();

export const Tables = Object.freeze({
  PRODUCTS: "products",
  PICKUP_LOCATIONS: "pickup_locations",
  DELIVERY_LOCATIONS: "delivery_locations",
  LOCATION_CODES: "location_codes",
  ACTIVITIES: "activities",
  KRAMBAMBOULI_CUSTOMERS: "krambambouli_customers",
  KRAMBAMBOULI_DELIVERY_ADDRESS: "krambambouli_pick_up_locations",
  KRAMBAMBOULI_PICK_UP_LOCATION: "krambambouli_pick_up_locations",
  KRAMBAMBOULI_ORDERS: "krambambouli_orders",
  USERS: "users",
});

function getEnv(key: string) {
  const value = process.env[key];
  if (!value) throw Error(`Missing env variable: ${key}`);
  return value;
}

export type Tables = typeof Tables;

export const DatabaseConfig = Object.freeze({
  host: getEnv("DB_HOST"),
  port: parseInt(getEnv("DB_PORT")),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD"),
  database: getEnv("DB_DATABASE"),
  waitForConnection: true,
  connectionLimit: 10,
});

export type DatabaseConfig = typeof DatabaseConfig;

export const Database = Object.freeze({
  TABLES: Tables,
  CONFIG: DatabaseConfig,
});

export type Database = typeof Database;
