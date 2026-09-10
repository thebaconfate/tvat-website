import { AsyncLocalStorage } from "node:async_hooks";
import type { PoolClient } from "pg";
import { database } from "./database";

// Stores the active transactional PoolClient for the current async execution chain
export const transactionStorage = new AsyncLocalStorage<PoolClient>();

export function Transactional<T extends (...args: any[]) => Promise<any>>(
  originalMethod: T,
  context: ClassMethodDecoratorContext,
) {
  return async function (
    this: any,
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    const activeClient = transactionStorage.getStore();

    // 1. Re-use existing transaction if already inside one
    if (activeClient) {
      return originalMethod.apply(this, args);
    }

    // 2. Otherwise start a new transaction
    return database.withTransaction<Awaited<ReturnType<T>>>(
      async (client: PoolClient) => {
        return transactionStorage.run(client, async () => {
          return originalMethod.apply(this, args);
        });
      },
    );
  };
}
