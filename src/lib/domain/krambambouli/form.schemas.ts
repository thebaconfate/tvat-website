import z4 from "zod/v4";

export const deliveryOptionEnumSchema = z4.enum(["delivery", "pickup"]);

const sharedFieldsSchema = z4.object({
  cart: z4
    .array(
      z4
        .object({
          productId: z4.int(),
          amount: z4.int().nonnegative(),
        })
        .loose(),
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
  pickupLocation: z4.int(),
});
export const deliveryFormSchema = z4.object({
  ...sharedFieldsSchema.shape,
  deliveryOption: z4.literal(deliveryOptionEnumSchema.enum.delivery),
  deliveryZone: z4.string(),
  streetName: z4.string(),
  streetNumber: z4.string(),
  bus: z4.string(),
  postcode: z4.string(),
  city: z4.string(),
});

export const krambambouliOrderFormSchema = z4.discriminatedUnion(
  "deliveryOption",
  [pickupFormSchema, deliveryFormSchema],
);
