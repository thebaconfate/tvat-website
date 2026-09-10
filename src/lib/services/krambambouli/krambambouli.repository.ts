import { database, type DatabaseClient } from "@/lib/database";
import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import type { PoolClient, QueryResult } from "pg";

type CustomerDetails = {
  email: string;
  firstName: string;
  lastName: string;
};

class KrambambouliRepository {
  async isFormEnabled(db: DatabaseClient = database): Promise<boolean> {
    const sql = `
        SELECT c.config_value AS "configValue"
        FROM config c WHERE c.config_key ILIKE 'krambambouli_form_enabled'
        `;
    const result: QueryResult<{ configValue: boolean }> = await db.query(sql);
    const [row] = result.rows;
    return row.configValue ?? false;
  }

  async findActiveProducts(
    db: DatabaseClient = database,
  ): Promise<KrambambouliProductData[] | null> {
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
    const result: QueryResult<KrambambouliProductData> = await db.query(sql);
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

  async createAddress(address: any, db: DatabaseClient = database) {}

  async createOrder(order: KrambambouliOrderFormData) {
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

export const krambambouliRepository = new KrambambouliRepository();
