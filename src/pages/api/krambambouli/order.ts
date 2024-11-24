import { z } from "zod";
import Database from "../../../lib/db";

export const prerender = false;
const userDetailsSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    deliveryOption: z.string(),
    owedAmount: z
      .string()
      .transform((val) => JSON.parse(val))
      .pipe(
        z.object({
          euros: z
            .string()
            .transform((eur) => Number(eur))
            .pipe(z.number().min(0)),
          cents: z
            .string()
            .transform((cent) => Number(cent))
            .pipe(z.number().min(0)),
        }),
      ),
  })
  .strict();

const pickUpLocationSchema = z.string();

const orderSchema = z
  .string()
  .array()
  .transform((vals) => vals.map((val) => JSON.parse(val)))
  .pipe(
    z
      .object({
        id: z
          .string()
          .transform((v) => Number(v))
          .pipe(z.number().nonnegative()),
        amount: z
          .string()
          .transform((v) => Number(v))
          .pipe(z.number().nonnegative()),
      })
      .array(),
  );

const deliveryAddressSchema = z.object({
  streetName: z.string().min(1),
  houseNumber: z.string().min(1),
  bus: z.string(),
  post: z
    .string()
    .transform((val) => Number(val))
    .pipe(z.number()),
  city: z.string().min(1),
});
function formContains(keys: string[], form: FormData) {
  return keys.every((key) => form.has(key));
}

function containsUserDetails(form: FormData) {
  return formContains(
    ["firstName", "lastName", "email", "deliveryOption", "owedAmount"],
    form,
  );
}

function constainsPickUpLocation(form: FormData) {
  return form.has("pickUpLocation");
}

function containsDeliveryDetails(form: FormData) {
  return formContains(
    [
      "deliveryStreetName",
      "deliveryStreetNumber",
      "deliveryPost",
      "deliveryCity",
      "deliveryBus",
    ],
    form,
  );
}

function containsOrder(form: FormData) {
  return form.has("order");
}

const badResponse = new Response(null, {
  status: 400,
});

const successResponse = new Response(null, {
  status: 201,
});

const internalServerError = new Response(null, {
  status: 500,
});
export async function POST({ request }: { request: Request }) {
  const formData = await request.formData();
  if (!containsUserDetails(formData)) return badResponse;
  const rawUserDetails = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    deliveryOption: formData.get("deliveryOption"),
    owedAmount: formData.get("owedAmount"),
  };
  console.log(rawUserDetails);
  try {
    const userDetails = userDetailsSchema.parse(rawUserDetails);
    if (rawUserDetails.deliveryOption === "pick up") {
      if (!constainsPickUpLocation(formData)) return badResponse;
      const rawPickUpLocation = formData.get("pickUpLocation");
      const pickUpLocation = pickUpLocationSchema.parse(rawPickUpLocation);
      if (!containsOrder(formData)) return badResponse;
      const rawOrders = formData.getAll("order");
      const orders = orderSchema.parse(rawOrders);
      const result = await Database.getInstance().then((database) =>
        database.createKrambambuliPickUpOrder(
          userDetails,
          pickUpLocation,
          orders,
        ),
      );
      if (result) return successResponse;
      else return internalServerError;
    } else if (rawUserDetails.deliveryOption === "delivery") {
      if (!containsDeliveryDetails(formData)) return badResponse;
      const rawDeliveryDetails = {
        streetName: formData.get("deliveryStreetName"),
        houseNumber: formData.get("deliveryStreetNumber"),
        bus: formData.get("deliveryBus"),
        post: formData.get("deliveryPost"),
        city: formData.get("deliveryCity"),
      };
      console.log(rawDeliveryDetails);
      const deliveryDetails = deliveryAddressSchema.parse(rawDeliveryDetails);
      console.log(deliveryDetails);
      if (!containsOrder(formData)) return badResponse;
      const rawOrders = formData.getAll("order");
      const orders = orderSchema.parse(rawOrders);
      const result = await Database.getInstance().then((database) =>
        database.createKrambambouliDeliveryOrder(
          userDetails,
          deliveryDetails,
          orders,
        ),
      );
      if (result) return successResponse;
      else return internalServerError;
    } else return badResponse;
  } catch (e: any) {
    console.error(e);
    return new Response(null, {
      status: 400,
    });
  }
}
