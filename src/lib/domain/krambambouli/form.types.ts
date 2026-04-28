import type z4 from "zod/v4";
import type { deliveryFormSchema, pickupFormSchema } from "./form.schemas";

export type pickupFormData = z4.infer<typeof pickupFormSchema>;
export type deliverFormData = z4.infer<typeof deliveryFormSchema>;
