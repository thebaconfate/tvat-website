import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();
console.log(process.env.DB_HOST);
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

  constructor() {}

  static async init() {
    await connectionPool.query("CREATE ");
    return new Database();
  }
}

const database = Database.init();
export default database;
