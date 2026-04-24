import { z } from "zod";
import type { KrambambouliCustomer } from "../../../lib/krambambouli";

export const prerender = false;

export async function POST({
  request,
}: {
  request: Request;
}): Promise<Response> {
  return new Response();
  /*
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
  */
}
