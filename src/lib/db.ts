import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

interface KrambambouliCustomer {
  firstName: string;
  lastName: string;
  email: string;
  deliveryOption: string;
  owedAmount: {
    euros: number;
    cents: number;
  };
}

interface Product {
  id: number;
  amount: number;
}

interface KrambambouliCustomerAddress {
  streetName: string;
  houseNumber: string;
  bus: string;
  post: number;
  city: string;
}

interface DbConfigInterface {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
}

interface Tables {
  products: "products";
  pickupLocations: "pickup_locations";
  deliveryLocations: "delivery_locations";
  locationCodes: "location_codes";
  activities: "activities";
  krambambouliCustomers: "krambambouli_customers";
  krambambouliDeliveryAddresses: "krambambouli_delivery_adresses";
  krambambouliPickUpLocation: "krambambouli_pick_up_locations";
  krambambouliOrders: "krambambouli_orders";
  users: "users";
}

const dbConfig: DbConfigInterface = {
  host: process.env.DB_HOST ?? "",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 0,
  user: process.env.DB_USER ?? "",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "",
  connectionLimit: 10,
};

const connectionPool = process.env.IS_BUILD
  ? undefined
  : mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    });

class Database {
  private static instance: Database | null = null;
  private tableNames: Tables;
  private pool: mysql.Pool;
  constructor(tableNames: Tables, pool: mysql.Pool) {
    this.tableNames = tableNames;
    this.pool = pool;
  }

  private static async init(tableNames: Tables, connectionPool: mysql.Pool) {
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
    await connectionPool.query(
      createTable(tableNames.krambambouliCustomers, [
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
      createTable(tableNames.krambambouliOrders, [
        "customer_id INT NOT NULL",
        "product_id INT NOT NULL",
        "amount INT NOT NULL",
        `FOREIGN KEY (customer_id) REFERENCES ${tableNames.krambambouliCustomers}(id) ON DELETE CASCADE`,
        `FOREIGN KEY (product_id) REFERENCES ${tableNames.products}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.krambambouliDeliveryAddresses, [
        "customer_id INT NOT NULL",
        "street_name VARCHAR(255) NOT NULL",
        "house_number VARCHAR(255) NOT NULL",
        "bus VARCHAR(255) NOT NULL",
        "post INT NOT NULL",
        "city VARCHAR(255)",
        `FOREIGN KEY (customer_id) REFERENCES ${tableNames.krambambouliCustomers}(id) ON DELETE CASCADE`,
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.krambambouliPickUpLocation, [
        "customer_id INT NOT NULL",
        "location VARCHAR(255)",
      ]),
    );
    await connectionPool.query(
      createTable(tableNames.users, [
        "id INT PRIMARY KEY AUTO_INCREMENT",
        "email VARCHAR(255) NOT NULL UNIQUE",
        "password VARCHAR(255) NOT NULL",
      ]),
    );
  }

  static async getInstance() {
    if (Database.instance) return Database.instance;
    else {
      const tableNames: Tables = {
        products: "products",
        pickupLocations: "pickup_locations",
        deliveryLocations: "delivery_locations",
        locationCodes: "location_codes",
        activities: "activities",
        krambambouliCustomers: "krambambouli_customers",
        krambambouliDeliveryAddresses: "krambambouli_delivery_adresses",
        krambambouliPickUpLocation: "krambambouli_pick_up_locations",
        krambambouliOrders: "krambambouli_orders",
        users: "users",
      };
      const connectionPool = mysql.createPool(dbConfig);
      Database.init(tableNames, connectionPool);
      const newInstance = new Database(tableNames, connectionPool);
      Database.instance = newInstance;
      return newInstance;
    }
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
    if (!this.pool) return [];
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

  private async createKrambambouliCustomer(
    connection: mysql.PoolConnection,
    customerFirstName: string,
    customerLastName: string,
    customerEmail: string,
    deliveryOption: string,
    euros: number,
    cents: number,
  ) {
    const query = `INSERT INTO ${this.tableNames.krambambouliCustomers} (first_name, last_name, email, delivery_option, owed_euros, owed_cents) values (?, ?, ?, ?, ?, ?)`;
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
    const query = `INSERT INTO ${this.tableNames.krambambouliPickUpLocation} (customer_id, location) values (?, ?)`;
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
    const query = `INSERT INTO ${this.tableNames.krambambouliDeliveryAddresses} (customer_id, street_name, house_number, bus, post, city) values (?, ?, ?, ?, ?, ?)`;
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
    const query = `INSERT INTO ${this.tableNames.krambambouliOrders} (customer_id, product_id, amount) values (?, ?, ?)`;
    return connection.execute(query, [customer_id, product_id, amount]);
  }

  async createKrambambuliPickUpOrder(
    userDetails: KrambambouliCustomer,
    pickupLocation: string,
    products: Product[],
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
    products: Product[],
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
    const query = `SELECT product_id as productId, amount FROM ${this.tableNames.krambambouliOrders}`;
    const [rows] = await this.pool.query<mysql.ResultSetHeader>(query);
    return rows;
  }

  async getKrambambouliOrdersByCustomer() {
    const query = `SELECT c.id as customerId, c.first_name as firstName, c.last_name as lastName, c.email, c.owed_euros as owedEuros, c.owed_cents as owedCents, paid, JSON_ARRAYAGG(JSON_OBJECT('productId', o.product_id, 'amount', o.amount)) as orders FROM ${this.tableNames.krambambouliCustomers} c LEFT JOIN ${this.tableNames.krambambouliOrders} o ON c.id = o.customer_id GROUP BY c.id`;
    const [rows] = await this.pool.query(query);
    return rows;
  }

  async getUser(email: string) {
    const query = `SELECT * FROM ${this.tableNames.users} WHERE email = ?`;
    const [rows] = await this.pool.query<mysql.QueryResult>(query, [email]);
    const result = rows as { id?: number; email: string; password: string }[];
    return result[0];
  }

  async saveUser(email: string, password: string) {
    const query = `INSERT INTO ${this.tableNames.users} (email, password)  VALUES (?, ?)`;
    await this.pool.execute(query, [email, password]);
  }

  async countUsers() {
    interface Count {
      count: number;
    }
    const query = `SELECT COUNT(*) AS count FROM ${this.tableNames.users}`;
    const [rows] = await this.pool.query(query);
    const result = rows as Count[];
    console.log(result);
    return result[0].count;
  }

  async updateKrambambouliPayment(customerId: number, paid: boolean) {
    const query = `UPDATE ${this.tableNames.krambambouliCustomers} SET paid = ? WHERE id = ?`;
    await this.pool.query(query, [paid, customerId]);
    return;
  }
}

export default Database;
