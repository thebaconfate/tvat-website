import { database, type DatabaseClient } from "@/lib/infrastructure/database";
import { transactionStorage } from "../infrastructure/transaction";

export class Repository {
  protected get db(): DatabaseClient {
    return transactionStorage.getStore() ?? database;
  }
}
