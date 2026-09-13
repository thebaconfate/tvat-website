import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import { KrambambouliRepository } from "@/lib/repositories/krambambouli";

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

  async createOrder(order: KrambambouliOrderFormData) {
    return this.repository.createOrder(order);
  }

  async getOrders(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Page<OrderData>> {
    return this.repository.getOrders(pageNumber, pageSize);
  }
}

export const krambambouliService = new KrambambouliService();
