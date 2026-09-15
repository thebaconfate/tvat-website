import type {
  DeliveryZoneData,
  KrambambouliOrderFormData,
  KrambambouliProductData,
  PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import { KrambambouliRepository } from "@/lib/repositories/krambambouli";
import { mailService } from "../mail";
import { orderSchema } from "@/lib/domain/krambambouli/order.schema";

class KrambambouliService {
  private readonly mailService: typeof mailService;

  constructor(
    private readonly repository: KrambambouliRepository = new KrambambouliRepository(),
  ) {
    this.mailService = mailService;
  }

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
    const savedOrder = await this.repository.createOrder(order);
    await this.mailService.sendOrderConfirmation(savedOrder);
    return savedOrder;
  }

  async getOrders(
    pageNumber?: number,
    pageSize?: number,
  ): Promise<Page<OrderData>> {
    return this.repository.getOrders(pageNumber, pageSize);
  }
}

export const krambambouliService = new KrambambouliService();
