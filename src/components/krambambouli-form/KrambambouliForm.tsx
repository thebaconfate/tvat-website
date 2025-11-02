import React, { useEffect, useState } from "react";
import "./styles.css";
import DOMPurify from "dompurify";
import { apiRoutes } from "../../lib/routes";
import { createUrl } from "../../lib/utils";
import { Popup } from "../popup/Popup";
import { PopupEnum } from "../../lib/popup";
import type { ProductInterface } from "../../lib/interfaces/database/product";
import type { PickupLocationInterface } from "../../lib/interfaces/database/pickupLocation";
import type { DeliveryZoneInterface } from "../../lib/interfaces/database/deliveryZone";
import {
  DeliveryLocation,
  PickupLocation,
  Price,
  Product,
} from "../../lib/store";
import { useForm } from "react-hook-form";
import {
  krambambouliBaseOrderSchema,
  krambambouliDeliveryOrderSchema,
  krambambouliDeliverySchema,
  krambambouliOrderSchema,
  KrambambouliPickupOrder,
  krambambouliPickupOrderSchema,
  krambambouliPickupSchema,
  type KrambambouliDelivery,
  type KrambambouliOrder,
  type KrambambouliPickup,
} from "../../lib/krambambouli/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod/v4";

interface Props {
  products: ProductInterface[];
  pickUpLocations: PickupLocationInterface[];
  deliveryLocations?: DeliveryZoneInterface[];
}

type BaseForm = z.infer<typeof krambambouliBaseOrderSchema>;
type PickupForm = z.infer<typeof krambambouliPickupOrderSchema>;
type DeliveryForm = z.infer<typeof krambambouliDeliveryOrderSchema>;
const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  streetName: null,
  streetNumber: null,
  bus: null,
  post: null,
  city: null,
};

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

  const baseForm = useForm<BaseForm>({
    resolver: zodResolver(krambambouliBaseOrderSchema),
  });
  const pickupForm = useForm<KrambambouliPickup>({
    resolver: zodResolver(krambambouliPickupSchema),
  });

  const deliveryForm = useForm<KrambambouliDelivery>({
    resolver: zodResolver(krambambouliDeliverySchema),
  });

  const deliveryOption = baseForm.watch("deliveryOption");

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

  const [amountList, setAmountList] = useState(products.map((_) => 0));
  const [selectedOption, setSelectedOption] = useState<null | DeliveryOption>(
    null,
  );
  const [selectedPickUpOption, setSelectedPickUpOption] = useState<
    null | number
  >(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<
    null | number
  >(null);
  const [form, setForm] = useState<Form>(initialForm);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState({
    title: PopupEnum.SUCCESS,
    text: "",
  });

  function handleChangeOption(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedOption(value as DeliveryOption);
  }

  function handleChangePickUpOption(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedPickUpOption(parseInt(e.target.value));
  }

  function makeHandleChangeAmount(idx: number) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      const copy = [...amountList];
      copy[idx] = value <= 0 ? 0 : value;
      setAmountList(copy);
    };
  }

  function makeHandlePressAmount(func: (x: number) => number) {
    return (idx: number) => {
      return (_: React.MouseEvent<HTMLButtonElement>) => {
        const value = func(amountList[idx]);
        const copy = [...amountList];
        copy[idx] = value <= 0 ? 0 : value;
        setAmountList(copy);
      };
    };
  }

  const handlePressAmountDec = makeHandlePressAmount((x: number) =>
    x <= 0 ? 0 : x - 1,
  );
  const handlePressAmountInc = makeHandlePressAmount((x: number) => x + 1);

  function makeHandleChangeDeliveryOption(idx: number) {
    return (_: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedDeliveryOption(idx);
  }

  function calcTotalAmount() {
    const total = amountList.reduce(
      (acc: Price, amount: number, index: number) =>
        acc.add(products[index].price.mult(amount)),
      new Price(0),
    );
    if (selectedOption === DeliveryOption.Delivery)
      if (selectedDeliveryOption != null && deliveryLocations)
        return total.add(deliveryLocations[selectedDeliveryOption].price);
    return total;
  }

  function handleTextInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleNumberInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: parseInt(value) });
  }
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", sanitize(form.firstName));
    formData.append("lastName", sanitize(form.lastName));
    formData.append("email", sanitize(form.email));
    formData.append("deliveryOption", sanitize(selectedOption));
    const total = calcTotalAmount();
    formData.append(
      "owedAmount",
      JSON.stringify({
        euros: sanitize(total.euros),
        cents: sanitize(total.cents),
      }),
    );
    if (
      selectedOption === DeliveryOption.PickUp &&
      selectedPickUpOption != null
    ) {
      if (selectedPickUpOption >= 0)
        formData.append(
          "pickUpLocation",
          sanitize(pickupLocations[selectedPickUpOption].id),
        );
    } else if (
      selectedOption === DeliveryOption.Delivery &&
      selectedDeliveryOption != null
    ) {
      formData.append("deliveryStreetName", sanitize(form.streetName));
      formData.append("deliveryStreetNumber", sanitize(form.streetNumber));
      formData.append("deliveryBus", sanitize(form.bus ?? ""));
      formData.append("deliveryPost", sanitize(form.post));
      formData.append("deliveryCity", sanitize(form.city));
    }
    if (amountList.every((a) => a === 0)) {
      setPopupContent({
        title: PopupEnum.ERROR,
        text: "Voeg eerst producten toe aan je winkelmand",
      });
      setShowPopup(true);
      return;
    }
    for (let i = 0; i < products.length; i++) {
      if (amountList[i] > 0)
        formData.append(
          "order",
          JSON.stringify({
            id: sanitize(products[i].id),
            amount: sanitize(amountList[i]),
          }),
        );
    }
    await fetch(
      createUrl([
        window.location.origin,
        apiRoutes.krambambouli.url,
        apiRoutes.krambambouli.order.url,
      ]),
      {
        method: "POST",
        body: formData,
      },
    ).then((response) => {
      if (!response.ok) {
        setPopupContent({
          title: PopupEnum.ERROR,
          text: "Er is iets misgegaan bij het opsturen van de gegevens, probeer het later op nieuw",
        });
        setShowPopup(true);
      } else {
        setPopupContent({
          title: PopupEnum.SUCCESS,
          text: "Dankje voor de bestelling, eenmaal dat we de betaling hebben ontvangen zullen we dit zo snel mogelijk behandelen en brouwen. Je zult nog een mail krijgen ivm afhaling of levering",
        });
        setShowPopup(true);
        setAmountList(products.map((_) => 0));
        setSelectedPickUpOption(null);
        setSelectedDeliveryOption(null);
        setSelectedOption(null);
        setForm(initialForm);
      }
    });
  }

  return (
    <div className="form-container">
      <form onSubmit={onSubmit}>
        <div className="products-container">
          {products.map((product, index) => {
            return (
              <div key={product.id} className="product">
                <picture className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name + "image"} />
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
                    <button type="button" onClick={handlePressAmountDec(index)}>
                      -
                    </button>
                    <input
                      type="number"
                      value={amountList[index]}
                      onChange={makeHandleChangeAmount(index)}
                    />
                    <button type="button" onClick={handlePressAmountInc(index)}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="fields-container">
          <div className="field-row">
            <div className="field-col">
              <label htmlFor="firstName">Voornaam</label>
              <input
                id="firstName"
                type="text"
                placeholder="John"
                required
                {...register("firstName")}
              />
            </div>
            <div className="field-col">
              <label form="lastName">Achternaam</label>
              <input
                id="lastName"
                type="text"
                placeholder="Doe"
                required
                {...register("lastName")}
              />
            </div>
          </div>
          <div className="field-row">
            <label form="email">E-mail</label>
            <input
              id="email"
              type="email"
              required
              placeholder="john.doe@hotmail.com"
              value={form.email}
              onChange={handleTextInput}
              name="email"
            />
          </div>
          <div className="field-row radio-options-container">
            <label>Leveringsopties</label>
            <label>
              <input
                type="radio"
                name="option"
                required
                value={DeliveryOption.PickUp}
                checked={selectedOption === DeliveryOption.PickUp}
                onChange={handleChangeOption}
              />
              {`Afhalen tussen ${dateToDDMM(krambambouliCantusDate)} en ${dateToDDMMYYYY(pickupEndDate)}`}
            </label>
            {deliveryLocations && (
              <label>
                <input
                  type="radio"
                  name="option"
                  required
                  value={DeliveryOption.Delivery}
                  checked={selectedOption === DeliveryOption.Delivery}
                  onChange={handleChangeOption}
                />
                {`Leveren tussen ${dateToDDMM(deliveryStartDate)} en ${dateToDDMM(deliveryEndDate)}`}
              </label>
            )}
          </div>
          {(deliveryOption === "pick up" && (
            <div className="field-row">
              <label>Afhaallocatie</label>
              {pickupLocations.map((loc, index) => {
                return (
                  <label key={index}>
                    <input
                      type="radio"
                      name="pick-up-option"
                      value={index}
                      required
                      checked={index == selectedPickUpOption}
                      onChange={handleChangePickUpOption}
                    />
                    {krambambouliCantus.description === loc.description
                      ? krambambouliCantus.description
                      : `Bij ${loc.description} vanaf ${pickupStartDate.getDate()}/${pickupStartDate.getMonth() + 1}`}
                  </label>
                );
              })}
            </div>
          )) ||
            (deliveryOption === "delivery" && deliveryLocations && (
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
                      value={form.streetName ?? ""}
                      name="streetName"
                      required
                      onChange={handleTextInput}
                    />
                    <label htmlFor="bus">Nummer</label>
                    <input
                      id="streetNumber"
                      type="text"
                      name="streetNumber"
                      required
                      value={form.streetNumber ?? ""}
                      onChange={handleTextInput}
                    />
                    <label>Bus</label>
                    <input
                      id="bus"
                      type="text"
                      name="bus"
                      value={form.bus ?? ""}
                      onChange={handleTextInput}
                    />
                  </div>
                  <div className="field-row">
                    <label htmlFor="post">Postcode</label>
                    <input
                      id="post"
                      type="number"
                      name="post"
                      value={form.post ?? ""}
                      onChange={handleNumberInput}
                      required
                    />
                    <label htmlFor="city">Stad</label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={form.city ?? ""}
                      name="city"
                      onChange={handleTextInput}
                    />
                  </div>
                </div>
              </>
            ))}
          <div className="information-container">
            <p>
              Totaalbedrag <b>{calcTotalAmount().toString()}</b>
            </p>
            <p>
              Over te schrijven naar de VATrekening: <b>BE60 7310 1732 4070</b>
            </p>
            <p>
              Met mededeling:{" "}
              <b>
                krambambouli +{" "}
                {!form.firstName && !form.lastName
                  ? "[Voornaam Achternaam]"
                  : [form.firstName, form.lastName].join(" ")}
              </b>
            </p>
          </div>
          {selectedOption !== null && (
            <div className="submit-button-container">
              <button type="submit">Bestellen</button>
            </div>
          )}
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
