import { database, type DatabaseClient } from "@/lib/infrastructure/database";
import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import type { PoolClient, QueryResult } from "pg";
import { transactionStorage } from "../infrastructure/transaction";

type CustomerDetails = {
  email: string;
  firstName: string;
  lastName: string;
};

export class KrambambouliRepository {
  private get db(): DatabaseClient {
    return transactionStorage.getStore() ?? database;
  }

  async isFormEnabled(): Promise<boolean> {
    const sql = `
        SELECT c.config_value AS "configValue"
        FROM config c WHERE c.config_key ILIKE 'krambambouli_form_enabled'
        `;
    const result: QueryResult<{ configValue: boolean }> =
      await this.db.query(sql);
    const [row] = result.rows;
    return row.configValue ?? false;
  }

  async findActiveProducts(): Promise<KrambambouliProductData[] | null> {
    const sql = `
    SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        p.price as "price"
    FROM products p
    WHERE p.active = TRUE
        AND p.category ILIKE '%krambambouli%'
    `;
    const result: QueryResult<KrambambouliProductData> =
      await this.db.query(sql);
    return result.rows;
  }

  async findActiveDeliveryZones(
    db: DatabaseClient = database,
  ): Promise<DeliveryZoneData[] | null> {
    const sql = `
    SELECT
        dz.id,
        dz.name,
        dz.postal_code_to AS "postalCodeTo",
        dz.postal_code_from AS "postalCodeFrom",
        dz.price AS "price"
    FROM krambambouli_delivery_zones dz
    WHERE dz.active = TRUE
    `;
    const result: QueryResult<DeliveryZoneData> = await db.query(sql);
    return result.rows;
  }
  async findActivePickupLocations(
    db: DatabaseClient = database,
  ): Promise<PickupLocationData[] | null> {
    const sql = `
    SELECT
        p.id,
        p.name
    FROM krambambouli_pickup_locations p
    WHERE p.active = TRUE
    `;
    const result: QueryResult<PickupLocationData> = await db.query(sql);
    return result.rows;
  }

  async upsertCustomer(
    customer: CustomerDetails,
    db: DatabaseClient = database,
  ): Promise<number> {
    const sql = `
        INSERT INTO customers (email, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE
            SET email = EXCLUDED.email
        RETURNING id
        `;
    const result: QueryResult<{ id: number }> = await db.query(sql, [
      customer.email,
      customer.firstName,
      customer.lastName,
    ]);
    return result.rows[0].id;
  }

  async createAddress(address: any) {}
  async createOrder(
    customerId: number,
    deliveryOption: "pickup" | "delivery",
    totalOwed: number,
    pickupLocationId?: number,
  ) {
    const createOrder = `
        INSERT INTO krambambouli_orders (
            customer_id,
            delivery_option,
            pickup_location_id,
            total_owed,
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
    const pickup = deliveryOption === "pickup";
    const orderResult = await this.db.query<{ id: string }>(createOrder, [
      customerId,
      deliveryOption,
      pickup ? pickupLocationId : null,
      totalOwed,
    ]);
    return orderResult.rows[0].id;
  }

  async createOrderItems(
    orderId: number,
    items: { productId: number; amount: number }[],
  ) {
    const [productIds, amounts] = items.reduce<[number[], number[]]>(
      ([ids, amts], item) => {
        ids.push(item.productId);
        amts.push(item.amount);
        return [ids, amts];
      },
      [[], []],
    );
    const sql = `
        INSERT INTO krambambouli_order_items (order_id, product_id, amount)
        SELECT $1, unnested.product_id, unnested.amount
        FROM UNNEST($2::int[], $3::int[]) AS unnested(product_id, amount)
        RETURNING *;
      `;
    const result = await this.db.query(sql, [orderId, productIds, amounts]);
    return result.rows;
  }

  async createOrderOld(order: KrambambouliOrderFormData) {
    return database.withTransaction(async (client: PoolClient) => {
      const createCustomerSql = `
        INSERT INTO customers (email, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE
            SET email = EXCLUDED.email
        RETURNING id
        `;
      const customerResult = await client.query<{ id: number }>(
        createCustomerSql,
        [order.email, order.firstName, order.lastName],
      );
      const customerId = customerResult.rows[0].id;
      const createOrder = `
        INSERT INTO krambambouli_orders (
            customer_id,
            delivery_option,
            pickup_location_id,
            total_owed,
        ) VALUES ($1, $2, $3, $4)
        RETURNING id
      `;
      const pickup = order.deliveryOption === "pickup";
      const totalOwed = 0;
      const orderResult = await client.query<{ id: string }>(createOrder, [
        customerId,
        order.deliveryOption,
        pickup ? order.pickupLocationId : null,
        totalOwed,
      ]);
      const orderId = orderResult.rows[0].id;
      const createOrderItem = `
        INSERT INTO krambambouli_order_items (order_id, product_id, amount)
        VALUES (%s, %s, %s)
      `;
      order.cart.map(
        async (i) =>
          await client.query(createOrderItem, [orderId, i.productId, i.amount]),
      );
      return;
    });
  }

  async getOrders(): Promise<Page<OrderData>> {
    return {
      page: { size: 0, number: 0, totalElements: 0, totalPages: 0 },
      content: [],
    };
  }
}
