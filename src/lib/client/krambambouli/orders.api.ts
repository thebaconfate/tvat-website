import {
  orderPatchSchema,
  orderQuerySchema,
  orderSchema,
} from "@/lib/domain/krambambouli";
import { API_ROUTES } from "@/lib/routes";
import { createRestApi } from "../rest-api";

export const ordersApi = createRestApi({
  url: API_ROUTES.KRAMBALBOULI.ORDERS.url,
  itemSchema: orderSchema,
  patchSchema: orderPatchSchema,
  querySchema: orderQuerySchema,
});
