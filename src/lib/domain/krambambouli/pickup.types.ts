import type z4 from "zod/v4";
import type { pickupLocationSchema } from "./pickup.schemas";

export type PickupLocationData = z4.infer<typeof pickupLocationSchema>;
