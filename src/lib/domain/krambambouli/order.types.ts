import type z4 from "zod/v4";
import type {
  orderFilterSchema,
  orderSchema,
  orderPatchSchema,
  orderQuerySchema,
} from "./order.schema";

export type OrderData = z4.infer<typeof orderSchema>;
export type OrderFilters = z4.infer<typeof orderFilterSchema>;
export type OrderPatch = z4.infer<typeof orderPatchSchema>;
export type OrderQuery = z4.infer<typeof orderQuerySchema>;
