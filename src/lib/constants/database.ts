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

export const Database = Object.freeze({
  TABLES: Tables,
});

export type Tables = typeof Tables;
export type Database = typeof Database;
