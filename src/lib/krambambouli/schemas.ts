import { z } from "zod/v4";

export enum DeliveryOptions {
  PickUp = "pick up",
  Delivery = "delivery",
}

export const krambambouliBaseOrderSchema = z.object({
  firstName: z.string().min(1, "First name cannot be the empty string"),
  lastName: z.string().min(1, "Last name cannot be the empty string"),
  email: z.email("Invalid email"),
  deliveryOption: z.enum(Object.values(DeliveryOptions)),
});

export type KrambambouliBaseOrder = z.infer<typeof krambambouliBaseOrderSchema>;

export const krambambouliPickupSchema = z.object({
  pickupLocation: z.number().int().nonnegative(),
  deliveryOption: z.literal(DeliveryOptions.PickUp),
});

export type KrambambouliPickup = z.infer<typeof krambambouliPickupSchema>;

export const krambambouliPickupOrderSchema = krambambouliBaseOrderSchema
  .omit({ deliveryOption: true })
  .extend({ ...krambambouliPickupSchema });

export type KrambambouliPickupOrder = z.infer<
  typeof krambambouliPickupOrderSchema
>;

export const krambambouliDeliverySchema = z.object({
  deliveryOption: z.literal(DeliveryOptions.Delivery),
  streetName: z.string().min(1),
  streetNumber: z.number().min(1),
  bus: z.string().optional(),
  post: z.number().int().nonnegative(),
  city: z.string().min(1),
});

export type KrambambouliDelivery = z.infer<typeof krambambouliDeliverySchema>;

export const krambambouliDeliveryOrderSchema = krambambouliBaseOrderSchema
  .omit({ deliveryOption: true })
  .extend({ ...krambambouliDeliverySchema });

export type KrambambouliDeliveryOrder = z.infer<
  typeof krambambouliDeliveryOrderSchema
>;

export const krambambouliOrderSchema = z.discriminatedUnion("deliveryOption", [
  krambambouliPickupOrderSchema,
  krambambouliDeliveryOrderSchema,
]);

export type KrambambouliOrder = z.infer<typeof krambambouliOrderSchema>;
