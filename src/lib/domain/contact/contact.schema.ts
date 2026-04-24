import z4 from "zod/v4";

export const contactFormSchema = z4.object({
  name: z4.string().nonempty(),
  email: z4.email(),
  subject: z4.string().nonempty(),
  message: z4.string().nonempty(),
});
