import { database } from "@/lib/database";
import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";

class KrambambouliService {
  async formActive(): Promise<boolean> {
    const sql = `
        SELECT c.config_value AS "configValue"
        FROM config c WHERE c.config_key ILIKE 'krambambouli_form_enabled'
        `;
    const result = await database.query<{ configValue: boolean }>(sql);
    const [row] = result.rows;
    return row.configValue ?? false;
  }

  async getKrambambouliProducts(): Promise<KrambambouliProductData[] | null> {
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
    const result = await database.query<KrambambouliProductData>(sql);
    return result.rows;
  }

  async getDeliveryLocations(): Promise<DeliveryZoneData[] | null> {
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
    const result = await database.query<DeliveryZoneData>(sql);
    return result.rows;
  }
  async getPickupLocations(): Promise<PickupLocationData[] | null> {
    const sql = `
    SELECT
        p.id,
        p.name
    FROM krambambouli_pickup_locations p
    WHERE p.active = TRUE
    `;
    const result = await database.query<PickupLocationData>(sql);
    return result.rows;
  }

  async createOrder(order: KrambambouliOrderFormData) {
    return database.withTransaction(async (client) => {
      const createClientSql = `
        INSERT INTO customers (email, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE
            SET email = EXCLUDED.email
        RETURNING id
        `;
      const customerResult = await client.query<{ id: number }>(
        createClientSql,
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
      return client.query(createOrder, [
        customerId,
        order.deliveryOption,
        pickup ? order.pickupLocationId : null,
        totalOwed,
      ]);
    });
  }
}

export const krambambouliService = new KrambambouliService();
