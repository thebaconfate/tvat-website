import mysql from "mysql2/promise";
import {
  Database as DatabaseConstants,
  type Tables,
} from "./constants/database";
import type {
  KrambambouliCustomer,
  KrambambouliCustomerAddress,
  KrambambouliProduct,
} from "./krambambouli";
//import * as dotenv from "dotenv";

//dotenv.config();

class Database {
  private static instance: Database | null = null;
  private tables: Tables;
  private pool: mysql.Pool;

  constructor(tables: Tables, pool: mysql.Pool) {
    this.tables = tables;
    this.pool = pool;
  }

  private static async init(
    tables: Tables = DatabaseConstants.TABLES,
    connectionPool: mysql.Pool,
  ) {
    function createTableIfNotExists(tableName: string, values: string[]) {
      return `CREATE TABLE IF NOT EXISTS ${tableName} (${values.join(", ")})`;
    }

    await connectionPool.query(
      createTableIfNotExists(tables.PRODUCTS, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "name VARCHAR(255) NOT NULL UNIQUE",
        "description VARCHAR(255)",
        "image_url VARCHAR(255)",
        "euros INT DEFAULT 0",
        "cents INT DEFAULT 0",
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.PICKUP_LOCATIONS, [
        "name VARCHAR(255) PRIMARY KEY",
        "area VARCHAR(255) NOT NULL",
      ]),
    );

    await connectionPool.query(
      createTableIfNotExists(tables.DELIVERY_LOCATIONS, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "area VARCHAR(255) NOT NULL UNIQUE",
        "euros INT DEFAULT 0",
        "cents INT DEFAULT 0",
      ]),
    );

    await connectionPool.query(
      createTableIfNotExists(tables.LOCATION_CODES, [
        "location_id INT NOT NULL",
        "lower INT",
        "upper INT",
        "CHECK (lower <= upper)",
        `FOREIGN KEY (location_id) REFERENCES ${tables.DELIVERY_LOCATIONS}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.ACTIVITIES, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "name VARCHAR(255) NOT NULL",
        "location VARCHAR(255) NOT NULL",
        "description VARCHAR(255)",
        "date DATETIME NOT NULL",
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.KRAMBAMBOULI_CUSTOMERS, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "first_name VARCHAR(255) NOT NULL",
        "last_name VARCHAR(255) NOT NULL",
        "email VARCHAR(255) NOT NULL",
        "delivery_option VARCHAR(255) NOT NULL",
        "owed_euros INT NOT NULL",
        "owed_cents INT NOT NULL",
        "paid BOOLEAN NOT NULL DEFAULT FALSE",
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.KRAMBAMBOULI_ORDERS, [
        "customer_id INT NOT NULL",
        "product_id INT NOT NULL",
        "amount INT NOT NULL",
        `FOREIGN KEY (customer_id) REFERENCES ${tables.KRAMBAMBOULI_CUSTOMERS}(id) ON DELETE CASCADE`,
        `FOREIGN KEY (product_id) REFERENCES ${tables.PRODUCTS}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.KRAMBAMBOULI_DELIVERY_ADDRESS, [
        "customer_id INT NOT NULL",
        "street_name VARCHAR(255) NOT NULL",
        "house_number VARCHAR(255) NOT NULL",
        "bus VARCHAR(255) NOT NULL",
        "post INT NOT NULL",
        "city VARCHAR(255)",
        `FOREIGN KEY (customer_id) REFERENCES ${tables.KRAMBAMBOULI_CUSTOMERS}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.KRAMBAMBOULI_PICK_UP_LOCATION, [
        "customer_id INT NOT NULL",
        "location VARCHAR(255)",
      ]),
    );
    await connectionPool.query(
      createTableIfNotExists(tables.USERS, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "email VARCHAR(255) NOT NULL UNIQUE",
        "password VARCHAR(255) NOT NULL",
      ]),
    );
  }

  static async getInstance() {
    if (Database.instance) return Database.instance;
    else {
      console.log(DatabaseConstants.CONFIG);
      const connectionPool = mysql.createPool(DatabaseConstants.CONFIG);
      Database.init(DatabaseConstants.TABLES, connectionPool);
      const newInstance = new Database(
        DatabaseConstants.TABLES,
        connectionPool,
      );
      Database.instance = newInstance;
      return newInstance;
    }
  }

  private createColumnNames(tableName: string, values: string[]) {
    return values.map((val) => `${tableName}.${val}`).join(", ");
  }

  /* PRODUCTS */

  async getKrambambouliProducts() {
    const table = this.tables.PRODUCTS;
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
    if (!this.pool) return [];
    const table = this.tables.PICKUP_LOCATIONS;
    const [rows] = await this.pool.query(
      `SELECT ${this.createColumnNames(table, ["name", "area"])} FROM ${table};`,
    );
    return rows;
  }

  async getDeliveryLocations() {
    const deliverTable = this.tables.DELIVERY_LOCATIONS;
    const codesTable = this.tables.LOCATION_CODES;
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
    const activitiesTable = this.tables.ACTIVITIES;
    const [rows] = await this.pool.query(
      `SELECT * from ${activitiesTable} WHERE lower(${activitiesTable}.name) LIKE '%krambambouli%' AND lower(${activitiesTable}.name) LIKE '%cantus%' ORDER BY ${activitiesTable}.date DESC LIMIT 1; `,
    );
    return rows;
  }

  private async createKrambambouliCustomer(
    connection: mysql.PoolConnection,
    customerFirstName: string,
    customerLastName: string,
    customerEmail: string,
    deliveryOption: string,
    euros: number,
    cents: number,
  ) {
    const query = `INSERT INTO ${this.tables.KRAMBAMBOULI_CUSTOMERS} (first_name, last_name, email, delivery_option, owed_euros, owed_cents) values (?, ?, ?, ?, ?, ?)`;
    const [insertResult] = await connection.execute<mysql.ResultSetHeader>(
      query,
      [
        customerFirstName,
        customerLastName,
        customerEmail,
        deliveryOption,
        euros,
        cents,
      ],
    );
    return insertResult;
  }

  private async createKrambambouliCustomerPickUpLocation(
    connection: mysql.PoolConnection,
    customer_id: number,
    pickupLocation: string,
  ) {
    const query = `INSERT INTO ${this.tables.KRAMBAMBOULI_PICK_UP_LOCATION} (customer_id, location) values (?, ?)`;
    await connection.execute(query, [customer_id, pickupLocation]);
  }

  private async createKrambambouliCustomerDeliveryAddress(
    connection: mysql.PoolConnection,
    customer_id: number,
    streetName: string,
    houseNumber: string,
    bus: string,
    post: number,
    city: string,
  ) {
    const query = `INSERT INTO ${this.tables.KRAMBAMBOULI_DELIVERY_ADDRESS} (customer_id, street_name, house_number, bus, post, city) values (?, ?, ?, ?, ?, ?)`;
    await connection.execute(query, [
      customer_id,
      streetName,
      houseNumber,
      bus,
      post,
      city,
    ]);
  }

  private async createKrambambouliCustomerOrderPromise(
    connection: mysql.PoolConnection,
    customer_id: number,
    product_id: number,
    amount: number,
  ) {
    const query = `INSERT INTO ${this.tables.KRAMBAMBOULI_ORDERS} (customer_id, product_id, amount) values (?, ?, ?)`;
    return connection.execute(query, [customer_id, product_id, amount]);
  }

  async createKrambambuliPickUpOrder(
    userDetails: KrambambouliCustomer,
    pickupLocation: string,
    products: KrambambouliProduct[],
  ) {
    if (!this.pool) return null;
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const row = await this.createKrambambouliCustomer(
        conn,
        userDetails.firstName,
        userDetails.lastName,
        userDetails.email,
        userDetails.deliveryOption,
        userDetails.owedAmount.euros,
        userDetails.owedAmount.cents,
      );
      if (!row.insertId) throw new Error("failed to insert customer");
      await this.createKrambambouliCustomerPickUpLocation(
        conn,
        row.insertId,
        pickupLocation,
      );
      await Promise.all(
        products.map((product) =>
          this.createKrambambouliCustomerOrderPromise(
            conn,
            row.insertId,
            product.id,
            product.amount,
          ),
        ),
      );
      await conn.commit();
      return row.insertId;
    } catch (e: any) {
      console.error(e);
      await conn.rollback();
      return null;
    } finally {
      conn.release();
    }
  }

  async createKrambambouliDeliveryOrder(
    userDetails: KrambambouliCustomer,
    customerAddress: KrambambouliCustomerAddress,
    products: KrambambouliProduct[],
  ) {
    if (!this.pool) return null;
    const conn = await this.pool.getConnection();
    try {
      await conn.beginTransaction();
      const row = await this.createKrambambouliCustomer(
        conn,
        userDetails.firstName,
        userDetails.lastName,
        userDetails.email,
        userDetails.deliveryOption,
        userDetails.owedAmount.euros,
        userDetails.owedAmount.cents,
      );
      if (!row.insertId) throw new Error("failed to insert customer");
      await this.createKrambambouliCustomerDeliveryAddress(
        conn,
        row.insertId,
        customerAddress.streetName,
        customerAddress.houseNumber,
        customerAddress.bus,
        customerAddress.post,
        customerAddress.city,
      );
      await Promise.all(
        products.map((product) =>
          this.createKrambambouliCustomerOrderPromise(
            conn,
            row.insertId,
            product.id,
            product.amount,
          ),
        ),
      );
      await conn.commit();
      return row.insertId;
    } catch (e: any) {
      console.error(e);
      await conn.rollback();
      return null;
    } finally {
      conn.release();
    }
  }

  async getKrambambouliOrders() {
    const query = `SELECT product_id as productId, amount FROM ${this.tables.KRAMBAMBOULI_ORDERS}`;
    const [rows] = await this.pool.query<mysql.ResultSetHeader>(query);
    return rows;
  }

  async getKrambambouliOrdersByCustomer() {
    const query = `SELECT c.id as customerId, c.first_name as firstName, c.last_name as lastName, c.email, c.owed_euros as owedEuros, c.owed_cents as owedCents, paid, JSON_ARRAYAGG(JSON_OBJECT('productId', o.product_id, 'amount', o.amount)) as orders FROM ${this.tables.KRAMBAMBOULI_CUSTOMERS} c LEFT JOIN ${this.tables.KRAMBAMBOULI_ORDERS} o ON c.id = o.customer_id GROUP BY c.id`;
    const [rows] = await this.pool.query(query);
    return rows;
  }

  async getUser(email: string) {
    const query = `SELECT * FROM ${this.tables.USERS} WHERE email = ?`;
    const [rows] = await this.pool.query<mysql.QueryResult>(query, [email]);
    const result = rows as { id?: number; email: string; password: string }[];
    return result[0];
  }

  async saveUser(email: string, password: string) {
    const query = `INSERT INTO ${this.tables.USERS} (email, password)  VALUES (?, ?)`;
    await this.pool.execute(query, [email, password]);
  }

  async countUsers() {
    interface Count {
      count: number;
    }
    const query = `SELECT COUNT(*) AS count FROM ${this.tables.USERS}`;
    const [rows] = await this.pool.query(query);
    const result = rows as Count[];
    console.log(result);
    return result[0].count;
  }

  async updateKrambambouliPayment(customerId: number, paid: boolean) {
    const query = `UPDATE ${this.tables.KRAMBAMBOULI_CUSTOMERS} SET paid = ? WHERE id = ?`;
    await this.pool.query(query, [paid, customerId]);
    return;
  }
}

export default Database;
