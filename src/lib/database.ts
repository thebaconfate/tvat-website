import {
  createPool,
  type FieldPacket,
  type Pool,
  type PoolConnection,
  type QueryResult,
  type ResultSetHeader,
  type RowDataPacket,
  type TypeCastField,
  type TypeCastNext,
} from "mysql2/promise";
import {
  Database as DatabaseConstants,
  type Tables,
} from "./constants/database";
import type { ProductInterface } from "./interfaces/database/product";
import type { PickupLocationInterface } from "./interfaces/database/pickupLocation";
import type { DeliveryZoneInterface } from "./interfaces/database/deliveryZone";
import type {
  KrambambouliCustomer,
  KrambambouliCustomerAddress,
  KrambambouliProduct,
} from "./krambambouli";
import type { OrderInterface } from "./interfaces/database/order";

function castTinyintToBoolean(field: TypeCastField, next: TypeCastNext) {
  if (field.type === "TINY" && field.length === 1) {
    return field.string() === "1";
  }
  return next();
}

class Database {
  private static instance: Database | null = null;
  private static tables: Tables = DatabaseConstants.TABLES;
  private static retries = 5;
  private pool: Pool;

  constructor() {
    this.pool = createPool({
      ...DatabaseConstants.CONFIG,
      typeCast: castTinyintToBoolean,
    });
  }

  static async getInstance(retries: number = Database.retries) {
    let lastError;
    if (Database.instance) return Database.instance;
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Retried ${i} times`);
        const instance = new Database();
        await instance.pool.query("SELECT 1");
        Database.instance = instance;
        return Database.instance;
      } catch (err) {
        lastError = err;
        console.warn("DB connection failed, retrying...", err);
        if (!isConnectionError(err)) break;
        Database.instance = null;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    const msg = `Could not connect to database after ${retries} attempts`;
    console.error(msg);
    throw Error(msg);
  }

  private async connect() {
    this.pool = createPool({
      ...DatabaseConstants.CONFIG,
      typeCast: castTinyintToBoolean,
    });
  }

  private async query<T extends RowDataPacket[]>(
    sql: string,
    params: any[] = [],
    retries: number = Database.retries,
  ) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return this.pool.query<T>(sql, params);
      } catch (err) {
        lastError = err;
        console.warn("Failed to query database, retrying...", err);
        if (isConnectionError(err)) await this.connect();
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw lastError;
  }

  private async execute<
    T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[],
  >(sql: string, params: any[] = [], retries: number = Database.retries) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        return this.pool.execute<T>(sql, params);
      } catch (err) {
        lastError = err;
        console.warn("Failed to query database, retrying...", err);
        if (isConnectionError(err)) await this.connect();
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw lastError;
  }

  private async withTransaction<
    T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[],
  >(
    transaction: (conn: PoolConnection) => Promise<[T, FieldPacket[]]>,
    retries: number = Database.retries,
  ) {
    let lastError;
    for (let i = 0; i < retries; i++) {
      let connection;
      try {
        connection = await this.pool.getConnection();
        await connection.beginTransaction();
        const result = await transaction(connection);
        await connection.commit();
        connection.release();
        return result;
      } catch (error) {
        lastError = error;
        console.warn("Failed to do transaction, retrying...", error);
        if (connection)
          try {
            await connection?.rollback();
          } catch {}
        if (isConnectionError(error)) await this.connect();
        await new Promise((r) => setTimeout(r, 500));
      } finally {
        connection?.release();
      }
    }
    throw lastError;
  }

  static async init(tables: Tables = DatabaseConstants.TABLES) {
    const database = await Database.getInstance();
    const connectionPool = database.pool;

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

  private createColumnNames(tableName: string, values: string[]) {
    return values.map((val) => `${tableName}.${val}`).join(", ");
  }

  /* PRODUCTS */

  async getKrambambouliProducts() {
    const table = Database.tables.PRODUCTS;
    const [rows] = await this.query<ProductInterface[]>(
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
    const table = Database.tables.PICKUP_LOCATIONS;
    const [rows] = await this.query<PickupLocationInterface[]>(
      `SELECT ${this.createColumnNames(table, ["id", "description"])} FROM ${table} WHERE active = TRUE;`,
    );
    return rows;
  }

  /* DELIVERY LOCATIONS */
  async getDeliveryLocations() {
    const deliverTable = Database.tables.DELIVERY_LOCATIONS;
    const codesTable = Database.tables.LOCATION_CODES;
    const [rows] = await this.query<DeliveryZoneInterface[]>(
      `SELECT ${this.createColumnNames(deliverTable, [
        "area",
      ])}, JSON_OBJECT('euros', ${deliverTable}.euros, 'cents', ${deliverTable}.cents) AS price, JSON_ARRAYAGG(JSON_OBJECT('areaStart', ${codesTable}.area_start, 'areaEnd', ${
        codesTable
      }.area_end)) AS ranges FROM ${deliverTable} JOIN ${
        codesTable
      } ON ${deliverTable}.id = ${codesTable}.location_id GROUP BY ${
        deliverTable
      }.area`,
    );
    return rows;
  }

  private async createKrambambouliCustomer(
    customerFirstName: string,
    customerLastName: string,
    customerEmail: string,
    deliveryOption: string,
    euros: number,
    cents: number,
    connection: PoolConnection | undefined = undefined,
  ): Promise<[ResultSetHeader, FieldPacket[]]> {
    const sql = `INSERT INTO ${Database.tables.KRAMBAMBOULI_CUSTOMERS} (first_name, last_name, email, delivery_option, owed_euros, owed_cents) values (?, ?, ?, ?, ?, ?)`;
    const params = [
      customerFirstName,
      customerLastName,
      customerEmail,
      deliveryOption,
      euros,
      cents,
    ];
    if (connection) {
      return connection.execute<ResultSetHeader>(sql, params);
    }
    return this.execute<ResultSetHeader>(sql, params);
  }

  private async createKrambambouliCustomerPickUpLocation(
    customer_id: number,
    pickupLocation: number,
    connection: PoolConnection | undefined = undefined,
  ) {
    const sql = `INSERT INTO ${Database.tables.KRAMBAMBOULI_PICK_UP_LOCATION} (customer_id, pickup_location_id) values (?, ?)`;
    const params = [customer_id, pickupLocation];
    if (connection) {
      return connection.execute<ResultSetHeader>(sql, params);
    }
    return this.execute<ResultSetHeader>(sql, params);
  }

  private async createKrambambouliCustomerDeliveryAddress(
    customer_id: number,
    streetName: string,
    houseNumber: string,
    bus: string,
    post: number,
    city: string,
    connection: PoolConnection | undefined = undefined,
  ) {
    const query = `INSERT INTO ${Database.tables.KRAMBAMBOULI_DELIVERY_ADDRESS} (customer_id, street_name, house_number, bus, post, city) values (?, ?, ?, ?, ?, ?)`;
    if (!connection) {
      connection = await this.pool.getConnection();
    }
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
    customer_id: number,
    product_id: number,
    amount: number,
    connection: PoolConnection | undefined = undefined,
  ) {
    const query = `INSERT INTO ${Database.tables.KRAMBAMBOULI_ORDERS} (customer_id, product_id, amount) values (?, ?, ?)`;
    if (!connection) {
      connection = await this.pool.getConnection();
    }
    return connection.execute(query, [customer_id, product_id, amount]);
  }

  async createKrambambuliPickupOrder(
    userDetails: KrambambouliCustomer,
    pickupLocation: number,
    products: KrambambouliProduct[],
  ) {
    const [row] = await this.withTransaction<ResultSetHeader>(async (conn) => {
      const result = await this.createKrambambouliCustomer(
        userDetails.firstName,
        userDetails.lastName,
        userDetails.email,
        userDetails.deliveryOption,
        userDetails.owedAmount.euros,
        userDetails.owedAmount.cents,
        conn,
      );
      const [row] = result;
      if (!row.insertId) throw new Error("failed to insert customer");
      await this.createKrambambouliCustomerPickUpLocation(
        row.insertId,
        pickupLocation,
        conn,
      );
      await Promise.all(
        products.map((product) =>
          this.createKrambambouliCustomerOrderPromise(
            row.insertId,
            product.id,
            product.amount,
            conn,
          ),
        ),
      );
      return result;
    });
    return row.insertId;
  }

  async createKrambambouliDeliveryOrder(
    userDetails: KrambambouliCustomer,
    customerAddress: KrambambouliCustomerAddress,
    products: KrambambouliProduct[],
  ) {
    const [result] = await this.withTransaction<ResultSetHeader>(
      async (conn) => {
        const result = await this.createKrambambouliCustomer(
          userDetails.firstName,
          userDetails.lastName,
          userDetails.email,
          userDetails.deliveryOption,
          userDetails.owedAmount.euros,
          userDetails.owedAmount.cents,
          conn,
        );
        const [row] = result;
        if (!row.insertId) throw new Error("failed to insert customer");
        await this.createKrambambouliCustomerDeliveryAddress(
          row.insertId,
          customerAddress.streetName,
          customerAddress.houseNumber,
          customerAddress.bus,
          customerAddress.post,
          customerAddress.city,
          conn,
        );
        await Promise.all(
          products.map((product) =>
            this.createKrambambouliCustomerOrderPromise(
              row.insertId,
              product.id,
              product.amount,
              conn,
            ),
          ),
        );
        return result;
      },
    );
    return result;
  }

  // TODO: Refactor
  async getKrambambouliOrders() {
    const query = `SELECT product_id as productId, amount FROM ${Database.tables.KRAMBAMBOULI_ORDERS}`;
    const [rows] = await this.pool.query<ResultSetHeader>(query);
    return rows;
  }

  // TODO: Refactor
  async getKrambambouliOrdersByCustomer(
    start: Date | undefined = undefined,
    end: Date | undefined = undefined,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<Page<OrderInterface>> {
    const offset = (page - 1) * pageSize;
    if (!start) {
      start = new Date();
      start = new Date(start.getFullYear(), 0, 1, 0, 0, 0, 0);
    }
    if (!end) {
      end = new Date(start.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    if (start.getTime() > end.getTime()) {
      const tmp = start;
      start = end;
      end = tmp;
    }
    const sql = `
            SELECT
                c.id as customerId,
                c.first_name as firstName,
                c.last_name as lastName,
                c.email,
                c.paid ,
                c.fulfilled ,
                JSON_OBJECT(
                    'euros', c.owed_euros,
                    'cents', c.owed_cents) as owed,
                c.created_at as createdAt,
                pl.description,
                d.street_name as streetName,
                d.house_number as houseNumber,
                d.bus as bus,
                d.post as post,
                d.city as city,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'productId', o.product_id,
                        'amount', o.amount)) as orders
            FROM ${Database.tables.KRAMBAMBOULI_CUSTOMERS} c
            LEFT JOIN ${Database.tables.KRAMBAMBOULI_PICK_UP_LOCATION} pjt ON pjt.customer_id = c.id
            LEFT JOIN ${Database.tables.PICKUP_LOCATIONS} pl ON pjt.pickup_location_id = pl.id
            LEFT JOIN ${Database.tables.KRAMBAMBOULI_DELIVERY_ADDRESS} d ON d.customer_id = c.id
            LEFT JOIN ${Database.tables.KRAMBAMBOULI_ORDERS} o ON c.id = o.customer_id
            WHERE c.created_at >= ? AND created_at < ?
            GROUP BY c.id, pl.description, d.street_name, d.house_number, d.bus, d.post, d.city
            LIMIT ${pageSize} OFFSET ${offset}`;
    const countSql = `
            SELECT COUNT(*) as total
            FROM krambambouli_customers
            WHERE created_at >= ? AND created_at < ?`;
    const [[rows], [total]] = await Promise.all([
      this.pool.query<OrderInterface[]>(sql, [start, end]),
      this.pool.query<RowDataPacket[]>(countSql, [start, end]),
    ]);
    return {
      content: rows,
      page: page,
      pageSize: pageSize,
      total: total[0].total,
    };
  }

  // TODO: Refactor
  async getUser(email: string) {
    const query = `SELECT * FROM ${Database.tables.USERS} WHERE email = ?`;
    const [rows] = await this.pool.query<QueryResult>(query, [email]);
    const result = rows as { id?: number; email: string; password: string }[];
    return result[0];
  }

  // TODO: Refactor
  async saveUser(email: string, password: string) {
    const query = `INSERT INTO ${Database.tables.USERS} (email, password)  VALUES (?, ?)`;
    await this.pool.execute(query, [email, password]);
  }

  // TODO: Refactor
  async countUsers() {
    interface Count {
      count: number;
    }
    const query = `SELECT COUNT(*) AS count FROM ${Database.tables.USERS}`;
    const [rows] = await this.pool.query(query);
    const result = rows as Count[];
    console.log(result);
    return result[0].count;
  }

  // TODO: Refactor
  async updateKrambambouliPayment(customerId: number, paid: boolean) {
    const query = `UPDATE ${Database.tables.KRAMBAMBOULI_CUSTOMERS} SET paid = ? WHERE id = ?`;
    await this.pool.query(query, [paid, customerId]);
    return;
  }

  async updateKrambambouliFulfillment(customerId: number, fulfilled: boolean) {
    const sql = `
        UPDATE ${Database.tables.KRAMBAMBOULI_CUSTOMERS}
        SET fulfilled = ? WHERE id = ?`;
    await this.execute(sql, [fulfilled, customerId]);
    return;
  }
}

function isConnectionError(err: any): boolean {
  const connectionErrors = [
    "PROTOCOL_CONNECTION_LOST",
    "ECONNREFUSED",
    "ETIMEDOUT",
  ];
  return connectionErrors.includes(err.code);
}

export default Database;
