import { database } from "@/lib/database";
import type {
  DeliveryZoneData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";

class KrambambouliService {
  async formActive(): Promise<boolean> {
    const sql = `
        SELECT c.config_value AS "configValue"
        FROM config c WHERE c.config_key ILIKE 'krambambouli_enabled'
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
        ) as "price"
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
        json_build_object(
            'euros', dz.euros,
            'cents', dz.cents
        ) AS "price"
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
}

export const krambambouliService = new KrambambouliService();
