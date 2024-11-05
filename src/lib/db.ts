import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

const connectionPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
});

class Database {
  private pool = connectionPool;
  private tableNames: { [key: string]: string };
  constructor(tableNames: { [key: string]: string }) {
    this.tableNames = tableNames;
  }

  static async init() {
    const tableNames = {
      products: "products",
      pickupLocations: "pickup_locations",
      deliveryLocations: "delivery_locations",
      locationCodes: "location_codes",
      activities: "activities",
      krambambouliCustomers: "krambambouli_customers",
      deliverAddress: "deliver_address",
      krambambouliOrders: "krambambouli_orders",
    };
    const createTable = (tableName: string, values: string[]) =>
      `CREATE TABLE IF NOT EXISTS ${tableName} (${values.join(", ")})`;
    await connectionPool.query(
      createTable(tableNames.products, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "name VARCHAR(255) NOT NULL UNIQUE",
        "description VARCHAR(255)",
        "image_url VARCHAR(255)",
        "euros INT DEFAULT 0",
        "cents INT DEFAULT 0",
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.pickupLocations, [
        "name VARCHAR(255) PRIMARY KEY",
        "area VARCHAR(255) NOT NULL",
      ]),
    );

    await connectionPool.query(
      createTable(tableNames.deliveryLocations, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "area VARCHAR(255) NOT NULL UNIQUE",
        "euros INT DEFAULT 0",
        "cents INT DEFAULT 0",
      ]),
    );

    await connectionPool.query(
      createTable(tableNames.locationCodes, [
        "location_id INT NOT NULL",
        "lower INT",
        "upper INT",
        "CHECK (lower <= upper)",
        `FOREIGN KEY (location_id) REFERENCES ${tableNames.deliveryLocations}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.activities, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "name VARCHAR(255) NOT NULL",
        "location VARCHAR(255) NOT NULL",
        "description VARCHAR(255)",
        "date DATETIME NOT NULL",
      ]),
    );
    await connectionPool.query(createTable(tableNames.krambambouliOrders, []));
    return new Database(tableNames);
  }

  private createColumnNames(tableName: string, values: string[]) {
    return values.map((val) => `${tableName}.${val}`).join(", ");
  }

  /* PRODUCTS */

  async getKrambambouliProducts() {
    const table = this.tableNames.products;
    const [rows] = await this.pool.query(
      `SELECT ${this.createColumnNames(table, [
        "id",
        "name",
        "description",
        "image_url as imageUrl",
      ])}, JSON_OBJECT("euros", ${this.createColumnNames(table, [
        "euros",
      ])} , "cents", ${this.createColumnNames(table, ["cents"])}) AS price
FROM ${table}  WHERE LOWER(name) LIKE '%krambambouli%'`,
    );
    return rows;
  }

  /* KRAMBAMBOULI */

  /* AFHAAL LOCATIES*/
  async getPickUpLocation() {
    const table = this.tableNames.pickupLocations;
    const [rows] = await this.pool.query(
      `SELECT ${this.createColumnNames(table, ["name", "area"])} FROM ${table};`,
    );
    return rows;
  }

  async getDeliveryLocations() {
    const deliverTable = this.tableNames.deliveryLocations;
    const codesTable = this.tableNames.locationCodes;
    const [rows] = await this.pool.query(
      `SELECT ${this.createColumnNames(deliverTable, [
        "area",
      ])}, JSON_OBJECT('euros', ${deliverTable}.euros, 'cents', ${deliverTable}.cents) AS price, JSON_ARRAYAGG(JSON_OBJECT('lower', ${codesTable}.lower, 'upper', ${
        codesTable
      }.upper)) AS ranges FROM ${deliverTable} JOIN ${
        codesTable
      } ON ${deliverTable}.id = ${codesTable}.location_id GROUP BY ${
        deliverTable
      }.area`,
    );
    return rows;
  }
  async getKrambambouliCantus() {
    const activitiesTable = this.tableNames.activities;
    const [rows] = await this.pool.query(
      `SELECT * from ${activitiesTable} WHERE lower(${activitiesTable}.name) LIKE '%krambambouli%' AND lower(${activitiesTable}.name) LIKE '%cantus%' ORDER BY ${activitiesTable}.date DESC LIMIT 1; `,
    );
    return rows;
  }
}

const database = await Database.init();
export default database;
