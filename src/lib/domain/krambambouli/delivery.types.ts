import type z4 from "zod/v4";
import type { deliveryZoneSchema } from "./delivery.schemas";

export type DeliveryZoneData = z4.infer<typeof deliveryZoneSchema>;
