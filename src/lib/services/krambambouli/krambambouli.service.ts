import { database } from "@/lib/infrastructure/database";
import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import { KrambambouliRepository } from "@/lib/repositories";
import { Transactional } from "@/lib/infrastructure/transaction";

class KrambambouliService {
  constructor(
    private readonly repository: KrambambouliRepository = new KrambambouliRepository(),
  ) {}

  async formActive(): Promise<boolean> {
    return this.repository.isFormEnabled();
  }

  async getKrambambouliProducts(): Promise<KrambambouliProductData[] | null> {
    return this.repository.findActiveProducts();
  }

  async getDeliveryLocations(): Promise<DeliveryZoneData[] | null> {
    return this.repository.findActiveDeliveryZones();
  }

  async getPickupLocations(): Promise<PickupLocationData[] | null> {
    return this.repository.findActivePickupLocations();
  }

  @Transactional
  async createOrder(order: KrambambouliOrderFormData) {
    return database.withTransaction(async (client) => {
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

export const krambambouliService = new KrambambouliService();
