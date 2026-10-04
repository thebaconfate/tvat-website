import type z4 from "zod/v4";
import type { orderFilterSchema, orderSchema } from "./order.schema";

export type OrderData = z4.infer<typeof orderSchema>;
export type OrderFilters = z4.infer<typeof orderFilterSchema>;
