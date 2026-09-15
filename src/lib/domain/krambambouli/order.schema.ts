import z4 from "zod/v4";
import { deliveryFormSchema, pickupFormSchema } from "./form.schemas";

const itemSchema = z4.object({
  productId: z4.int(),
  productName: z4.string(),
  amount: z4.int(),
  price: z4.int(),
});

const sharedSchema = z4.object({
  id: z4.uuid(),
  firstName: z4.string(),
  lastName: z4.string(),
  orderNumber: z4.int(),
  email: z4.email(),
  orders: z4.array(itemSchema),
  totalOwed: z4.int(),
  deliveryFee: z4.int(),
  paid: z4.boolean(),
  received: z4.boolean(),
  createdAt: z4.coerce.date(),
});

const deliveryOrderSchema = z4.object({
  ...deliveryFormSchema.pick({
    deliveryOption: true,
    streetName: true,
    houseNumber: true,
    bus: true,
    postalCode: true,
    city: true,
  }).shape,
  ...sharedSchema.shape,
});

const pickupOrderSchema = z4.object({
  ...pickupFormSchema.pick({ deliveryOption: true, pickupLocationId: true })
    .shape,
  ...sharedSchema.shape,
  pickupLocationName: z4.string(),
});

export const orderSchema = z4.discriminatedUnion("deliveryOption", [
  deliveryOrderSchema,
  pickupOrderSchema,
]);
