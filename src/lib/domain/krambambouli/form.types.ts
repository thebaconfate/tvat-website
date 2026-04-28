import type z4 from "zod/v4";
import {
  deliveryOptionEnumSchema,
  type deliveryFormSchema,
  type krambambouliOrderFormSchema,
  type pickupFormSchema,
} from "./form.schemas";

export type PickupFormData = z4.infer<typeof pickupFormSchema>;
export type DeliverFormData = z4.infer<typeof deliveryFormSchema>;
export type KrambambouliOrderFormData = z4.infer<
  typeof krambambouliOrderFormSchema
>;
export type DeliveryOptionEnum = z4.infer<typeof deliveryOptionEnumSchema>;
export const DeliveryOptionEnum = deliveryOptionEnumSchema.enum;
