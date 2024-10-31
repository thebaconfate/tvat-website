import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
import type { ProductInterface } from "./store";
import { table } from "console";

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
      prices: "prices",
      products: "products",
      pickupLocations: "pickup_locations",
      deliveryLocations: "delivery_locations",
    };
    const createTable = (tableName: string, values: string[]) =>
      `CREATE TABLE IF NOT EXISTS ${tableName} (${values.join(", ")})`;
    await connectionPool.query(
      createTable(tableNames.prices, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "euros INT DEFAULT 0",
        "cents INT DEFAULT 0",
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.products, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "name VARCHAR(255) NOT NULL UNIQUE",
        "description VARCHAR(255)",
        "image_url VARCHAR(255)",
        "price_id INT NOT NULL",
        "FOREIGN KEY (price_id) REFERENCES prices(id) ON DELETE CASCADE",
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
        "area VARCHAR(255) NOT NULL",
      ]),
    );
    return new Database(tableNames);
  }

  private createColumnNames(tableName: string, values: string[]) {
    return values.map((val) => `${tableName}.${val}`).join(", ");
  }

  /* PRODUCTS */

  async getKrambambouliProducts() {
    const productTable = this.tableNames.products;
    const priceTable = this.tableNames.prices;
    const [rows] = await this.pool.query(
      `SELECT ${this.createColumnNames(productTable, [
        "id",
        "name",
        "description",
        "image_url as imageUrl",
      ])}, JSON_OBJECT("euros", ${this.createColumnNames(priceTable, [
        "euros",
      ])} , "cents", ${this.createColumnNames(priceTable, ["cents"])}) AS price
FROM ${productTable} INNER JOIN ${priceTable} ON ${priceTable}.id = ${productTable}.price_id WHERE LOWER(name) LIKE '%krambambouli%'`,
    );
    const products = rows as ProductInterface[];
    console.log(products);
    return products;
  }
}

const database = await Database.init();
export default database;
