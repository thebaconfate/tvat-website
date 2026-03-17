import z from "zod/v4";

export const activitySchema = z.object({
  name: z.string().min(3),
  date: z.iso.date(),
  time: z.iso.time(),
  location: z.object({
    name: z.string(),
    address: z.string().nullish(),
    lng: z.number().min(-180).max(180).nullish(),
    lat: z.number().min(-90).max(90).nullish(),
  }),
  facebook: z.url().nullish(),
});
