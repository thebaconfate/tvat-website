import z4 from "zod/v4";

const itemSchema = z4.object({
  orderId: z4.uuid(),
  productId: z4.int(),
  amount: z4.int(),
});

export const orderSchema = z4.object({
  id: z4.uuid(),
  firstName: z4.string(),
  lastName: z4.string(),
  orderNumber: z4.int(),
  email: z4.email(),
  orders: z4.array(itemSchema),
  totalOwed: z4.int(),
  paid: z4.boolean(),
  received: z4.boolean(),
  createdAt: z4.iso.datetime(),
});
