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

export type Tables = typeof Tables;

export const DatabaseConfig = Object.freeze({
  host: process.env.DB_HOST ?? "",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 0,
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "",
  connectionLimit: 10,
});

export type DatabaseConfig = typeof DatabaseConfig;

export const Database = Object.freeze({
  TABLES: Tables,
  CONFIG: DatabaseConfig,
});

export type Database = typeof Database;
