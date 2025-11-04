import { z } from "zod";
import Database from "../../../lib/database";
import type { KrambambouliCustomer } from "../../../lib/krambambouli";
import type { APIContext } from "astro";
import {
  DeliveryOptions,
  krambambouliOrderSchema,
} from "../../../lib/krambambouli/schemas";
import sanitizeHtml from "sanitize-html";

export const prerender = false;

type Order = { id: number; amount: number };
type PickupLocation = number;

function sanitize(dirty: string) {
  return sanitizeHtml(dirty, {
    allowedTags: [],
    allowedAttributes: {},
  });
}

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
export async function POST({ request }: APIContext): Promise<Response> {
  try {
    const body = await request.json();
    const order = krambambouliOrderSchema
      .and(
        z.object({
          owed: z.object({
            euros: z.number().nonnegative(),
            cents: z.number().nonnegative(),
          }),
        }),
      )
      .parse(body);
    const database = await Database.getInstance();
    const userDetails = {
      firstName: sanitize(order.firstName),
      lastName: sanitize(order.lastName),
      email: sanitize(order.email),
      deliveryOption: sanitize(order.deliveryOption),
      owedAmount: order.owed,
    };
    const orders = order.orders.map((o) => {
      return { id: o.productId, amount: o.amount };
    });
    if (order.deliveryOption === DeliveryOptions.PickUp) {
      await database.createKrambambuliPickupOrder(
        userDetails,
        order.pickupLocation,
        orders,
      );
    } else if (order.deliveryOption === DeliveryOptions.Delivery) {
      const deliveryDetails = {
        streetName: sanitize(order.streetName),
        houseNumber: order.streetNumber,
        ...(order.bus && { bus: sanitize(order.bus) }),
        post: order.post,
        city: sanitize(order.city),
      };
      await database.createKrambambouliDeliveryOrder(
        userDetails,
        deliveryDetails,
        orders,
      );
    }
    return new Response(null, { status: 201, statusText: "Placed order" });
  } catch (e) {
    console.log(e);
    return new Response(null, { status: 400, statusText: "Bad request" });
  }
}
