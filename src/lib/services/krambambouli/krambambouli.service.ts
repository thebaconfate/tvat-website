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

/** An order with this id already exists but belongs to a different customer. */
export class OrderConflictError extends Error {
  constructor() {
    super("An order with this id already exists");
    this.name = "OrderConflictError";
  }
}

export type CreateOrderResult = {
  order: OrderData;
  /** false when the order already existed (resubmission with the same id). */
  created: boolean;
  /** null when unknown: the email was handled by the original submission. */
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

  /**
   * Creates an order and sends the confirmation email.
   *
   * - A resubmission with the same `order.id` returns the existing order
   *   (`created: false`) and sends no second email.
   * - A failing email does not fail the order: it is already saved, so the
   *   caller gets the order with `emailSent: false`.
   */
  async createOrder(order: KrambambouliOrderFormData): Promise<CreateOrderResult> {
    const savedOrder = await this.repository.createOrder(order);
    if (!savedOrder) {
      const existing = order.id
        ? await this.repository.findOrderById(order.id)
        : null;
      // Only hand back the existing order to the customer who placed it.
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
