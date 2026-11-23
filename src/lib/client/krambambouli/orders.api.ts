import {
  orderPatchSchema,
  orderQuerySchema,
  orderSchema,
} from "@/lib/domain/krambambouli";
import { API_ROUTES } from "@/lib/routes";
import { createRestApi } from "../rest-api";

/**
 * Orders: `list` a page (with filters), `update` paid/received, `remove`.
 * `remove` gets a 501 from the server until deleting orders is implemented.
 */
export const ordersApi = createRestApi({
  url: API_ROUTES.KRAMBALBOULI.ORDERS.url,
  itemSchema: orderSchema,
  patchSchema: orderPatchSchema,
  querySchema: orderQuerySchema,
});
