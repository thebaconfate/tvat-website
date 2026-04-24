import z4 from "zod/v4";
import type { contactFormSchema } from "./contact.schema";

export type ContactFormType = z4.infer<typeof contactFormSchema>;
