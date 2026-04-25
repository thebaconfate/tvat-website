import { database } from "@/lib/database";
import type { KrambambouliProductData } from "@/lib/domain/krambambouli";
import type { DeliveryZoneInterface } from "@/lib/interfaces/database/deliveryZone";
import type { PickupLocationInterface } from "@/lib/interfaces/database/pickupLocation";

class KrambambouliService {
  async formActive(): Promise<boolean> {
    const sql = `
        SELECT config_value AS "configValue"
        FROM config WHERE key = krambambouli_enabled
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
        json_build_object(
            'euros', p.euros,
            'cents', p.cents
        ) as price
    FROM products p
    WHERE p.active = TRUE
        AND p.category ILIKE '%krambambouli%'
    `;
    const result = await database.query<KrambambouliProductData>(sql);
    return result.rows;
  }

  async getDeliveryLocations(): Promise<DeliveryZoneInterface[] | null> {
    // TODO: Wrong query, fix this
    const sql = `
    SELECT
        d.order_id AS "orderId",
        d.street_name AS "streetName",
        d.house_number AS "houseNumber",
        d.bus,
        d.postal_code AS "postalCode",
        d.city
    FROM krambambouli_delivery_locations d
    WHERE d.active = TRUE
    `;
    const result = await database.query<DeliveryZoneInterface>(sql);
    return result.rows;
    // TODO: Implement this
  }
  async getPickupLocations(): Promise<PickupLocationInterface[] | null> {
    const sql = `
    SELECT
        p.id,
        p.postal_code_from AS "postalCodeFrom",
        p.postal_code_to AS "postalCodeTo",
        p.name,
        json_build_object(
            'euros', p.euros,
            'cents', p.cents
        ) AS "price"
    FROM krambambouli_delivery_zones p WHERE p.active = TRUE
    `;
    const result = await database.query<PickupLocationInterface>(sql);
    return result.rows;
    // TODO: Implement this
  }
}

export const krambambouliService = new KrambambouliService();
