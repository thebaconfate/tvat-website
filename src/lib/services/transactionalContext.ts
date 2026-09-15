import { AsyncLocalStorage } from "node:async_hooks";
export const transactionStorage = new AsyncLocalStorage<PoolClient>();
import { database } from "../infrastructure/database";
import type { PoolClient } from "pg";

export function Transactional(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    // 1. Check if we are already inside an active transaction context
    const activeClient = transactionStorage.getStore();

    if (activeClient) {
      // Re-use the existing transaction connection
      return originalMethod.apply(this, args);
    }

    // 2. Otherwise, start a new transaction context
    return database.withTransaction(async (client: PoolClient) => {
      return transactionStorage.run(client, async () => {
        return originalMethod.apply(this, args);
      });
    });
  };

  return descriptor;
}
