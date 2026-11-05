import {
  orderFilterSchema,
  type DeliveryZoneData,
  type KrambambouliOrderFormData,
  type KrambambouliProductData,
  type PickupLocationData,
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

  async createOrder(order: KrambambouliOrderFormData): Promise<OrderData> {
    const savedOrder = await this.repository.createOrder(order);
    await this.mailService.sendOrderConfirmation(savedOrder);
    return savedOrder;
  }

  async patchOrder(order: Partial<KrambambouliOrderFormData>) {
    // TODO: implement this
  }

  async getOrders(urlSearchParams?: URLSearchParams): Promise<Page<OrderData>> {
    const paramsObj = urlSearchParams
      ? Object.fromEntries(urlSearchParams.entries())
      : {};
    const pageNumber = paramsObj.page ? parseInt(paramsObj.page) : 1;
    const pageSize = paramsObj.pageSize ? parseInt(paramsObj.pageSize) : 100;
    const filters = orderFilterSchema.parse(paramsObj);
    console.log(filters);
    return this.repository.getOrders(pageNumber, pageSize, filters);
  }
}

export const krambambouliService = new KrambambouliService();
