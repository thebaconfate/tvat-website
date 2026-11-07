import z4 from "zod/v4";

export const deliveryOptionEnumSchema = z4.enum(["delivery", "pickup"]);

const sharedFieldsSchema = z4.object({
  // Client-generated idempotency key: resubmitting the same order with the same id
  // returns the existing order instead of creating a duplicate. Optional so that
  // pages loaded before this was introduced keep working.
  id: z4.uuid().optional(),
  cart: z4
    .array(
      z4.object({
        productId: z4.int(),
        amount: z4.int().nonnegative(),
      }),
    )
    .refine(
      (val) => val.reduce((prev, current) => prev + current.amount, 0) > 0,
      { error: "No items added to cart" },
    ),
  firstName: z4.string().nonempty(),
  lastName: z4.string().nonempty(),
  email: z4.email(),
});

export const pickupFormSchema = z4.object({
  ...sharedFieldsSchema.shape,
  deliveryOption: z4.literal(deliveryOptionEnumSchema.enum.pickup),
  pickupLocationId: z4.int(),
});
export const deliveryFormSchema = z4.object({
  ...sharedFieldsSchema.shape,
  deliveryOption: z4.literal(deliveryOptionEnumSchema.enum.delivery),
  streetName: z4.string(),
  houseNumber: z4.string(),
  bus: z4.string(),
  postalCode: z4.string(),
  city: z4.string(),
});

export const krambambouliOrderFormSchema = z4.discriminatedUnion(
  "deliveryOption",
  [pickupFormSchema, deliveryFormSchema],
);
