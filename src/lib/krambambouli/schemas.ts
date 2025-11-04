import { z } from "zod/v4";

export enum DeliveryOptions {
  PickUp = "pick up",
  Delivery = "delivery",
}

export const krambambouliProductSchema = z.object({
  productId: z.number().int().nonnegative(),
  amount: z.number().int().nonnegative(),
});

export type KrambambouliProduct = z.infer<typeof krambambouliProductSchema>;

export const krambambouliBaseOrderSchema = z.object({
  firstName: z.string().min(1, "First name cannot be the empty string"),
  lastName: z.string().min(1, "Last name cannot be the empty string"),
  email: z.email("Invalid email"),
  orders: krambambouliProductSchema.array(),
});

export type KrambambouliBaseOrder = z.infer<typeof krambambouliBaseOrderSchema>;

export const krambambouliPickupSchema = z.object({
  pickupLocation: z.number().int().nonnegative(),
  deliveryOption: z.literal(DeliveryOptions.PickUp),
});

export type KrambambouliPickup = z.infer<typeof krambambouliPickupSchema>;

export const krambambouliPickupOrderSchema = z.object({
  ...krambambouliBaseOrderSchema.shape,
  ...krambambouliPickupSchema.shape,
});

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

export const krambambouliDeliveryOrderSchema = z.object({
  ...krambambouliBaseOrderSchema.shape,
  ...krambambouliDeliverySchema.shape,
});

export type KrambambouliDeliveryOrder = z.infer<
  typeof krambambouliDeliveryOrderSchema
>;

export const krambambouliOrderSchema = z.discriminatedUnion("deliveryOption", [
  krambambouliDeliveryOrderSchema,
  krambambouliPickupOrderSchema,
]);

export type KrambambouliOrder = z.infer<typeof krambambouliOrderSchema>;
