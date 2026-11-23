import z4 from "zod/v4";
import { listQuerySchema } from "../page/page.schema";
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

/** Filters for the order list. All optional; coerces, so it can parse a query string. */
export const orderFilterSchema = z4
  .object({
    orderNumber: z4.coerce.number().int(),
    fromDate: z4.coerce.date(),
    toDate: z4.coerce.date(),
    name: z4.string().nonempty(),
    price: z4.coerce.number().int(),
    // stringbool, not coerce.boolean: coerce turns any non-empty string, including
    // "false", into true.
    received: z4.stringbool(),
    paid: z4.stringbool(),
  })
  .partial();

/** The query for the order list: the page number plus the filters. */
export const orderQuerySchema = listQuerySchema.extend(orderFilterSchema.shape);

export const orderSchema = z4.discriminatedUnion("deliveryOption", [
  deliveryOrderSchema,
  pickupOrderSchema,
]);

export const orderPatchSchema = z4
  .strictObject(sharedSchema.pick({ paid: true, received: true }).shape)
  .partial()
  .refine((patch) => Object.values(patch).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });
