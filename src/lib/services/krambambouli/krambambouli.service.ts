import {
  type DeliveryZoneData,
  type KrambambouliOrderFormData,
  type KrambambouliProductData,
  type PickupLocationData,
} from "@/lib/domain/krambambouli";
import type {
  OrderData,
  OrderPatch,
  OrderQuery,
} from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import { KrambambouliRepository } from "@/lib/repositories/krambambouli";
import { mailService } from "../mail";

export class OrderConflictError extends Error {
  constructor() {
    super("An order with this id already exists");
    this.name = "OrderConflictError";
  }
}

export type CreateOrderResult = {
  order: OrderData;
  created: boolean;
  emailSent: boolean | null;
};

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

  async createOrder(
    order: KrambambouliOrderFormData,
  ): Promise<CreateOrderResult> {
    const savedOrder = await this.repository.createOrder(order);
    if (!savedOrder) {
      const existing = order.id
        ? await this.repository.findOrderById(order.id)
        : null;
      if (
        !existing ||
        existing.email.toLowerCase() !== order.email.toLowerCase()
      )
        throw new OrderConflictError();
      return { order: existing, created: false, emailSent: null };
    }
    const emailSent = await this.trySendOrderConfirmation(savedOrder);
    return { order: savedOrder, created: true, emailSent };
  }

  private async trySendOrderConfirmation(order: OrderData): Promise<boolean> {
    try {
      // Resend reports most failures by returning `error` instead of throwing.
      const { error } = await this.mailService.sendOrderConfirmation(order);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error(
        `Order #${order.orderNumber} (${order.id}) saved, but the confirmation email failed:`,
        e,
      );
      return false;
    }
  }

  async patchOrder(id: string, patch: OrderPatch): Promise<OrderData | null> {
    return this.repository.updateOrder(id, patch);
  }

  async getOrders(query: OrderQuery = { page: 1 }): Promise<Page<OrderData>> {
    const { page, pageSize, ...filters } = query;
    return this.repository.getOrders(page, pageSize, filters);
  }
}

export const krambambouliService = new KrambambouliService();
