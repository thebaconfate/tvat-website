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
import type { URLSearchParams } from "node:url";

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

  async getOrders(urlSearchParams?: URLSearchParams): Promise<Page<OrderData>> {
    const pageNumber = urlSearchParams
      ? parseInt(urlSearchParams.get("page") ?? "1")
      : 1;
    const pageSize = urlSearchParams
      ? parseInt(urlSearchParams.get("pageSize") ?? "100")
      : 100;
    return this.repository.getOrders(pageNumber, pageSize);
  }
}

export const krambambouliService = new KrambambouliService();
