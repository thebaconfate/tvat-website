import React, { useEffect, useState } from "react";
import "./styles.css";
import DOMPurify from "dompurify";
import { Popup } from "../popup/Popup";
import { PopupEnum } from "../../lib/popup";
import type { ProductInterface } from "../../lib/interfaces/database/product";
import type { PickupLocationInterface } from "../../lib/interfaces/database/pickupLocation";
import type { DeliveryZoneInterface } from "../../lib/interfaces/database/deliveryZone";
import { DeliveryLocation, PickupLocation, Product } from "../../lib/store";
import {
  DeliveryOptions,
  krambambouliBaseOrderSchema,
  krambambouliDeliverySchema,
  krambambouliOrderSchema,
  krambambouliPickupSchema,
  type KrambambouliOrder,
} from "../../lib/krambambouli/schemas";
import z from "zod/v4";
import { useForm } from "@tanstack/react-form";

interface Props {
  products: ProductInterface[];
  pickUpLocations: PickupLocationInterface[];
  deliveryLocations?: DeliveryZoneInterface[];
}

function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

const schema = krambambouliBaseOrderSchema
  .extend({ deliveryOption: z.enum(Object.values(DeliveryOptions)) })
  .and(krambambouliDeliverySchema.omit({ deliveryOption: true }).partial())
  .and(
    krambambouliPickupSchema
      .omit({ deliveryOption: true, pickupLocation: true })
      .extend({
        pickupLocation: z.string(),
      })
      .partial(),
  )
  .superRefine((data, ctx) => {
    if (data.deliveryOption === DeliveryOptions.PickUp)
      if (isNullOrUndefined(data.pickupLocation))
        ctx.addIssue({
          code: "custom",
          message:
            "pickupLocation is not optional when deliveryOption is pick up",
          path: ["pickupLocation"],
        });
      else {
        const n = Number(data.pickupLocation);
        const ns = krambambouliPickupSchema.pick({ pickupLocation: true });
        const result = ns.safeParse({ pickupLocation: n });
        if (result.error) {
          ctx.addIssue({
            code: "custom",
            message: result.error.message,
            path: ["pickupLocation"],
          });
        }
      }
    if (data.deliveryOption === DeliveryOptions.Delivery) {
      if (isNullOrUndefined(data.streetName))
        ctx.addIssue({
          code: "custom",
          message: "streetName is not optional when deliveryOption is delivery",
          path: ["streetName"],
        });
      else if (isNullOrUndefined(data.streetNumber))
        ctx.addIssue({
          code: "custom",
          message:
            "streetNumber is not optional when deliveryOption is delivery",
          path: ["streetNumber"],
        });
      if (isNullOrUndefined(data.post))
        ctx.addIssue({
          code: "custom",
          message: "post is not optional when deliveryOption is delivery",
          path: ["post"],
        });
      if (isNullOrUndefined(data.city))
        ctx.addIssue({
          code: "custom",
          message: "city is not optional when deliveryOption is delivery",
          path: ["city"],
        });
    }
  });

type KrambambouliForm = z.infer<typeof schema>;

function createPickupStartDate(str: string) {
  const strplit = str.split("/");
  const now = new Date();
  now.setDate(parseInt(strplit[0]));
  now.setMonth(parseInt(strplit[1]) - 1);
  return now;
}

function dateToDDMM(date: Date) {
  return [
    `${String(date.getDate()).padStart(2, "0")}`,
    `${String(date.getMonth() + 1).padStart(2, "0")}`,
  ].join("/");
}

function dateToDDMMYYYY(date: Date) {
  return [dateToDDMM(date), `${String(date.getFullYear())}`].join("/");
}
export default function KrambambouliForm(props: Props) {
  const products = props.products.map((product) => Product.from(product));
  const pickupLocations = props.pickUpLocations.map((l) =>
    PickupLocation.from(l),
  );
  const deliveryLocations = props.deliveryLocations?.map((loc) =>
    DeliveryLocation.from(loc),
  );

  const krambambouliCantus = pickupLocations.find((l) => {
    return l.description
      .toLowerCase()
      .replaceAll(" ", "")
      .includes("krambamboulicantus");
  });

  const form = useForm({
    validators: { onSubmit: krambambouliOrderSchema },
  });

  if (!krambambouliCantus)
    throw Error("No krambamboulicantus as pick up point");
  const match = krambambouliCantus.description.match(/\b(\d{1,2}\/\d{1,2})\b/);
  if (!match) throw Error("No pick up start date");

  const krambambouliCantusDate = createPickupStartDate(match[0]);
  const pickupStartDate = new Date(krambambouliCantusDate);
  pickupStartDate.setDate(pickupStartDate.getDate() + 1);
  const deliveryStartDate = new Date(pickupStartDate);

  const pickupEndDate = new Date(pickupStartDate);
  // Sets the pickupEndDate to the last day of February
  pickupEndDate.setFullYear(pickupStartDate.getFullYear() + 1);
  pickupEndDate.setDate(1);
  pickupEndDate.setMonth(2); // March
  pickupEndDate.setDate(pickupEndDate.getDate() - 1);

  const deliveryEndDate = new Date(deliveryStartDate);
  deliveryEndDate.setDate(deliveryEndDate.getDate() + 10);

  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<
    null | number
  >(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState({
    title: PopupEnum.SUCCESS,
    text: "",
  });

  function makeHandleChangeDeliveryOption(idx: number) {
    return (_: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedDeliveryOption(idx);
  }

  function calcTotalAmount() {}

  useEffect(() => {
    if (window)
      DOMPurify.setConfig({
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });
  }, []);

  function sanitize(input: any) {
    return DOMPurify.sanitize(input);
  }

  function closePopup() {
    setShowPopup(false);
  }

  return (
    <div className="form-container">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="products-container">
          {products.map((product) => {
            return (
              <form.Field key={product.id} name={product.id.toString()}>
                {(field) => {
                  console.log(field.state);
                  return (
                    <div key={product.id} className="product">
                      <picture className="product-image">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name + "image"}
                          />
                        ) : (
                          <img alt={product.name + "image"} />
                        )}
                      </picture>
                      <div className="product-info">
                        <h3 className="product-title">{product.name}</h3>
                        <div className="product-details">
                          <p>{product.description}</p>
                          <p>{product.price.toString()}</p>
                        </div>
                        <div className="product-button-container">
                          <button type="button">-</button>
                          <input type="number" />
                          <button type="button">+</button>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </form.Field>
            );
          })}
        </div>
        <div className="fields-container">
          <div className="field-row">
            <div className="field-col">
              <label htmlFor="firstName">Voornaam</label>
              <input id="firstName" type="text" placeholder="John" required />
            </div>
            <div className="field-col">
              <label form="lastName">Achternaam</label>
              <input id="lastName" type="text" placeholder="Doe" required />
            </div>
          </div>
          <div className="field-row">
            <label form="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              placeholder="john.doe@hotmail.com"
            />
          </div>
          <div className="field-row radio-options-container">
            <label>Leveringsopties</label>
            <label>
              <input type="radio" required value={DeliveryOptions.PickUp} />
              {`Afhalen tussen ${dateToDDMM(krambambouliCantusDate)} en ${dateToDDMMYYYY(pickupEndDate)}`}
            </label>
            {deliveryLocations && (
              <label>
                <input type="radio" required value={DeliveryOptions.Delivery} />
                {`Leveren tussen ${dateToDDMM(deliveryStartDate)} en ${dateToDDMM(deliveryEndDate)}`}
              </label>
            )}
          </div>
          {/*(deliveryOption === DeliveryOptions.PickUp && (
            <div className="field-row">
              <label>Afhaallocatie</label>
              {pickupLocations.map((loc, index) => {
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      value={loc.id}
                      required
                      {...register("pickupLocation", {
                        setValueAs: (v) => Number(v),
                      })}
                    />
                    {krambambouliCantus.description === loc.description
                      ? krambambouliCantus.description
                      : `Bij ${loc.description} vanaf ${pickupStartDate.getDate()}/${pickupStartDate.getMonth() + 1}`}
                  </label>
                );
              })}
            </div>
          )) ||
            (deliveryOption === DeliveryOptions.Delivery &&
              deliveryLocations && (
                <>
                  <div className="field-row">
                    <label form="delivery-option">Leveroptie</label>
                    {deliveryLocations.map((loc, idx) => {
                      return (
                        <span key={idx} className="delivery-row">
                          <label htmlFor={`delivery-option-${idx}`}>
                            <input
                              id={`delivery-option-${idx}`}
                              type="radio"
                              name="delivery-option"
                              value={idx}
                              required
                              checked={idx === selectedDeliveryOption}
                              onChange={makeHandleChangeDeliveryOption(idx)}
                            />
                            {`Levering ${loc.area}`}
                          </label>
                          <p>{loc.price.toString()}</p>
                        </span>
                      );
                    })}
                  </div>
                  <div className="address-row">
                    <div className="field-row">
                      <label htmlFor="streetName">Straatnaam</label>
                      <input
                        id="streetName"
                        type="text"
                        required
                        {...register("streetName")}
                      />
                      <label htmlFor="bus">Nummer</label>
                      <input
                        id="streetNumber"
                        type="number"
                        required
                        {...register("streetNumber", { valueAsNumber: true })}
                      />
                      <label>Bus</label>
                      <input id="bus" type="text" {...register("bus")} />
                    </div>
                    <div className="field-row">
                      <label htmlFor="post">Postcode</label>
                      <input
                        id="post"
                        type="number"
                        required
                        {...register("post", { valueAsNumber: true })}
                      />
                      <label htmlFor="city">Stad</label>
                      <input
                        id="city"
                        type="text"
                        required
                        {...register("city")}
                      />
                    </div>
                  </div>
                </>
              ))*/}
          <div className="information-container">
            <p>
              Totaalbedrag <b>{/*calcTotalAmount().toString()*/}</b>
            </p>
            <p>
              Over te schrijven naar de VATrekening: <b>BE60 7310 1732 4070</b>
            </p>
            <p>
              Met mededeling:{" "}
              <b>
                krambambouli +{" "}
                {/*!firstName && !lastName
                  ? "[Voornaam Achternaam]"
                  : [firstName, lastName].join(" ")*/}
              </b>
            </p>
          </div>
          {/*deliveryOption !== null && (
            <div className="submit-button-container">
              <button type="submit">Bestellen</button>
            </div>
          )*/}
        </div>
      </form>
      {showPopup && (
        <Popup
          title={popupContent.title}
          message={popupContent.text}
          onClose={closePopup}
        ></Popup>
      )}
    </div>
  );
}
