import { z } from "zod";
import Database from "../../../lib/database";
import type { KrambambouliCustomer } from "../../../lib/krambambouli";

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

const pickUpLocationSchema = z.coerce
  .number({ message: "pickup location is not a number" })
  .nonnegative("pickup location cannot be a negative number");

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

function containsPickupLocation(form: FormData) {
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

function isValidForm(form: FormData) {
  const validUser = containsUserDetails(form);
  const validPickup = containsPickupLocation(form);
  const validDelivery = containsDeliveryDetails(form);
  const validOrder = containsOrder(form);
  if (!validUser) console.error("Invalid user");
  if (!validOrder) console.error("Invalid order");
  if (!validPickup && !validDelivery)
    console.error("Invalid pickup or delivery");
  return validUser && validOrder && (validPickup || validDelivery);
}

const badResponse = new Response(null, {
  status: 400,
});

const successResponse = new Response(null, {
  status: 201,
});

type Order = { id: number; amount: number };
type PickupLocation = number;
async function createPickupOrder(
  userDetails: KrambambouliCustomer,
  pickupLocation: PickupLocation,
  orders: Order[],
) {
  const database = await Database.getInstance();
  return database.createKrambambuliPickupOrder(
    userDetails,
    pickupLocation,
    orders,
  );
}
export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  const formData = await request.formData();
  if (!isValidForm(formData)) return badResponse;
  const rawUserDetails = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    deliveryOption: formData.get("deliveryOption"),
    owedAmount: formData.get("owedAmount"),
  };
  try {
    const userDetails: KrambambouliCustomer =
      userDetailsSchema.parse(rawUserDetails);
    if (rawUserDetails.deliveryOption === "pick up") {
      const rawPickUpLocation = formData.get("pickUpLocation");
      console.log(rawPickUpLocation);
      console.log("parsing pickupLocation");
      const pickUpLocation: number =
        pickUpLocationSchema.parse(rawPickUpLocation);
      console.log("parsed pickupLocation");
      const rawOrders = formData.getAll("order");
      console.log("Parsing order");
      const orders: Order[] = orderSchema.parse(rawOrders);
      await createPickupOrder(userDetails, pickUpLocation, orders);
      return successResponse;
    } else if (rawUserDetails.deliveryOption === "delivery") {
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
      const rawOrders = formData.getAll("order");
      const orders = orderSchema.parse(rawOrders);
      await Database.getInstance().then((database) =>
        database.createKrambambouliDeliveryOrder(
          userDetails,
          deliveryDetails,
          orders,
        ),
      );
      return successResponse;
    } else return badResponse;
  } catch (e: any) {
    console.error(e);
    return new Response(null, {
      status: 400,
    });
  }
}
