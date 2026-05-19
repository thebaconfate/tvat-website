import type z4 from "zod/v4";
import type { orderSchema } from "./order.schema";

export type OrderData = z4.infer<typeof orderSchema>;
