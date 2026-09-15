import { AsyncLocalStorage } from "node:async_hooks";
import type { PoolClient } from "pg";
import { database } from "./database";

// Stores the active transactional PoolClient for the current async execution chain
export const transactionStorage = new AsyncLocalStorage<PoolClient>();

export function Transactional<This, Args extends any[], Return>(
  originalMethod: (this: This, ...args: Args) => Promise<Return>,
  _context: ClassMethodDecoratorContext<
    This,
    (this: This, ...args: Args) => Promise<Return>
  >,
) {
  return async function (this: This, ...args: Args): Promise<Return> {
    const activeClient = transactionStorage.getStore();

    // 1. Re-use existing transaction if already inside one
    if (activeClient) {
      return originalMethod.apply(this, args);
    }

    // 2. Otherwise start a new transaction
    return database.withTransaction<Return>(async (client: PoolClient) => {
      return transactionStorage.run(client, async () => {
        return originalMethod.apply(this, args);
      });
    });
  };
}
