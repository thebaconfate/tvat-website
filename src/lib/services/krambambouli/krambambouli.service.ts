import { database } from "@/lib/database";
import type { DeliveryZoneInterface } from "@/lib/interfaces/database/deliveryZone";
import type { PickupLocationInterface } from "@/lib/interfaces/database/pickupLocation";
import type { ProductInterface } from "@/lib/interfaces/database/product";

class KrambambouliService {
  async getKrambambouliProducts(): Promise<ProductInterface[] | null> {
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
    const result = await database.query<ProductInterface>(sql, []);
    return result.rows;
    // TODO: Implement this
  }
  async getDeliveryLocations(): Promise<DeliveryZoneInterface[] | null> {
    const sql = `

    `;
    const result = await database.query<DeliveryZoneInterface>(sql, []);
    return result.rows;
    // TODO: Implement this
  }
  async getPickupLocations(): Promise<PickupLocationInterface[] | null> {
    const sql = `

    `;
    const result = await database.query<PickupLocationInterface>(sql, []);
    return result.rows;
    // TODO: Implement this
  }
}

export const krambambouliService = new KrambambouliService();
