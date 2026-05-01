import { useMemo, useState } from "react";
import styles from "./KrambambouliForm.module.css";
import { Popup } from "@/components/popup/Popup";
import { PopupEnum } from "@/lib/popup";
import {
  DeliveryOptionEnum,
  deliveryOptionEnumSchema,
  type DeliveryZoneData,
  type KrambambouliProductData,
  type PickupLocationData,
} from "@/lib/domain/krambambouli";
import { useForm } from "@tanstack/react-form";
import z4 from "zod/v4";
import { productSchema } from "@/lib/domain/products";
import { fromCents } from "@/lib/domain/price/price.utils";

interface Props {
  products: KrambambouliProductData[];
  pickupLocations: PickupLocationData[];
  deliveryLocations?: DeliveryZoneData[];
}

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

type ZoneUI = {
  name: string;
  price: { euros: number; cents: number };
  ranges: { from: number; to: number }[];
};
export default function KrambambouliForm({
  products,
  pickupLocations,
  deliveryLocations,
}: Props) {
  const uniqueDeliveryOptions = useMemo(() => {
    if (!deliveryLocations) return deliveryLocations;
    const map = new Map<string, ZoneUI>();
    for (const loc of deliveryLocations) {
      if (!map.has(loc.name))
        map.set(loc.name, {
          name: loc.name,
          price: loc.price,
          ranges: [],
        });
      map.get(loc.name)!.ranges.push({
        from: loc.postalCodeFrom,
        to: loc.postalCodeTo,
      });
    }
    return Array.from(map.values());
  }, [deliveryLocations]);
  const [popup, setPopup] = useState({
    title: PopupEnum.SUCCESS,
    text: "",
    show: false,
  });
  const form = useForm({
    defaultValues: {
      cart: products.map((p) => {
        return { ...p, amount: 0 };
      }),
      firstName: "",
      lastName: "",
      email: "",
      deliveryOption: "",
      pickupLocation: 0,
      deliveryZone: "",
      streetName: "",
      streetNumber: "",
      bus: "",
      postcode: "",
      city: "",
    },
    validators: {
      onSubmit: z4
        .object({
          cart: z4.array(
            productSchema.extend({ amount: z4.int().nonnegative() }),
          ),
          firstName: z4.string().nonempty(),
          lastName: z4.string().nonempty(),
          email: z4.email().nonempty(),
          deliveryOption: deliveryOptionEnumSchema,
          pickupLocation: z4.int(),
          deliveryZone: z4.string(),
          streetName: z4.string(),
          streetNumber: z4.string(),
          bus: z4.string(),
          postcode: z4.string(),
          city: z4.string(),
        })
        .superRefine((val, ctx) => {
          if (val.cart.reduce((acc, product) => acc + product.amount, 0) <= 0)
            ctx.addIssue({
              code: "custom",
              path: ["cart"],
              message:
                "Je moet minstens één product aan je winkelmand toevoegen",
            });
          if (val.deliveryOption === DeliveryOptionEnum.pickup) {
            if (!pickupLocations.find((e) => e.id === val.pickupLocation))
              ctx.addIssue({
                code: "invalid_value",
                values: pickupLocations.map((l) => l.id),
                input: val.pickupLocation,
                path: ["pickupLocation"],
                message: "pickupLocation must be a valid location",
              });
          } else if (val.deliveryOption === DeliveryOptionEnum.delivery) {
          }
        }),
      /*
        .refine(
          (val) =>
            val.deliveryOption === DeliveryOptionEnum.delivery ||
            pickupLocations.find((e) => e.id === val.pickupLocation),
          { error: "Invalid pickup location" },
        )
        .refine(
          (val) =>
            val.deliveryOption === DeliveryOptionEnum.pickup ||
            ([
              val.deliveryZone,
              val.streetName,
              val.streetNumber,
              val.postcode,
              val.city,
            ].every((v) => v !== "") &&
              uniqueDeliveryOptions &&
              uniqueDeliveryOptions.some((o) =>
                o.ranges.some(
                  (r) =>
                    r.from <= parseInt(val.postcode) &&
                    r.to >= parseInt(val.postcode),
                ),
              )),
          { error: "Invalid delivery location" },
        ),
        */
    },
    onSubmit: async ({ value }) => {
      alert(`Success! : ${JSON.stringify(value, null, 2)}`);
      console.log(JSON.stringify(value, null, 2));
    },
    onSubmitInvalid: ({ formApi }) => {
      const errors = Object.values(formApi.state.fieldMeta)
        .flatMap((f) => f?.errors ?? [])
        .map((e) => e.message);
      setPopup({
        title: PopupEnum.ERROR,
        text: errors[0] ?? "Er is iets misgegaan, probeer het later opnieuw",
        show: true,
      });
    },
  });
  const krambambouliCantus = pickupLocations.find((l) => {
    return l.name
      .toLowerCase()
      .replaceAll(" ", "")
      .includes("krambamboulicantus");
  });

  if (!krambambouliCantus)
    throw Error("No krambamboulicantus as pick up point");
  const match = krambambouliCantus.name.match(/\b(\d{1,2}\/\d{1,2})\b/);
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

  function closePopup() {
    setPopup({ ...popup, show: false });
  }

  return (
    <div className={styles.formContainer}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        method="POST"
      >
        <form.Field name="cart" mode="array">
          {(fields) => (
            <div className={styles.productsContainer}>
              {fields.state.value.map((product, i) => (
                <div key={i} className={styles.product}>
                  <picture className={styles.productImage}>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name + "image"}
                      />
                    ) : (
                      <img alt={product.name + "image"} />
                    )}
                  </picture>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <div className={styles.productDetails}>
                      <p>{product.description}</p>
                      <p>{`€${product.price.euros},${product.price.cents === 0 ? "-" : product.price.cents}`}</p>
                    </div>
                    <form.Field name={`cart[${i}].amount`}>
                      {(field) => (
                        <div className={styles.productButtonContainer}>
                          <button
                            type="button"
                            className={styles.counterButton}
                            onClick={() =>
                              field.handleChange((old) => Math.max(0, old - 1))
                            }
                          >
                            -
                          </button>
                          <input
                            className={styles.productInput}
                            type="number"
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(
                                Math.max(0, Math.trunc(Number(e.target.value))),
                              )
                            }
                            name={`${product.id}-quantity`}
                          />
                          <button
                            type="button"
                            className={styles.counterButton}
                            onClick={() =>
                              field.handleChange((old) => Math.max(0, old + 1))
                            }
                          >
                            +
                          </button>
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form.Field>
        <div className={styles.fieldsContainer}>
          <div className={styles.fieldRow}>
            <form.Field name="firstName">
              {(field) => (
                <div className={styles.fieldCol}>
                  <label htmlFor={field.name}>Voornaam</label>
                  <input
                    id={field.name}
                    type="text"
                    placeholder="John"
                    name={field.name}
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
            <form.Field name="lastName">
              {(field) => (
                <div className={styles.fieldCol}>
                  <label htmlFor={field.name}>Achternaam</label>
                  <input
                    id={field.name}
                    type="text"
                    placeholder="Doe"
                    name={field.name}
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <form.Field name="email">
            {(field) => (
              <div className={styles.fieldRow}>
                <label htmlFor={field.name}>E-mail</label>
                <input
                  id={field.name}
                  type="email"
                  required
                  className={styles.input}
                  placeholder="john.doe@hotmail.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  name={field.name}
                  autoComplete="email"
                />
              </div>
            )}
          </form.Field>
          <form.Field name="deliveryOption">
            {(field) => (
              <div>
                <h4>Leveringsopties</h4>
                <label htmlFor={`${field.name}-${DeliveryOptionEnum.pickup}`}>
                  <input
                    type="radio"
                    className={styles.radioButton}
                    name={field.name}
                    id={`${field.name}-${DeliveryOptionEnum.pickup}`}
                    required
                    value={DeliveryOptionEnum.pickup}
                    checked={field.state.value === DeliveryOptionEnum.pickup}
                    onChange={() =>
                      field.handleChange(DeliveryOptionEnum.pickup)
                    }
                  />
                  {`Afhalen tussen ${dateToDDMM(krambambouliCantusDate)} en ${dateToDDMMYYYY(pickupEndDate)}`}
                </label>
                {uniqueDeliveryOptions && (
                  <label
                    htmlFor={`${field.name}-${DeliveryOptionEnum.delivery}`}
                  >
                    <input
                      type="radio"
                      className={styles.radioButton}
                      id={`${field.name}-${DeliveryOptionEnum.delivery}`}
                      name={field.name}
                      required
                      value={DeliveryOptionEnum.delivery}
                      checked={
                        field.state.value === DeliveryOptionEnum.delivery
                      }
                      onChange={() =>
                        field.handleChange(DeliveryOptionEnum.delivery)
                      }
                    />
                    {`Leveren tussen ${dateToDDMM(deliveryStartDate)} en ${dateToDDMM(deliveryEndDate)}`}
                  </label>
                )}
              </div>
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.values.deliveryOption}>
            {(deliveryOption) => {
              return (
                (deliveryOption === DeliveryOptionEnum.pickup && (
                  <form.Field name="pickupLocation">
                    {(field) => (
                      <div className={styles.fieldRow}>
                        <h4>Afhaallocatie</h4>
                        {pickupLocations.map((loc, index) => {
                          return (
                            <label
                              key={index}
                              htmlFor={`${field.name}-${index}`}
                            >
                              <input
                                type="radio"
                                className={styles.radioButton}
                                name={field.name}
                                id={`${field.name}-${index}`}
                                value={index}
                                required
                                checked={field.state.value === loc.id}
                                onChange={() => field.handleChange(loc.id)}
                              />
                              {krambambouliCantus.name === loc.name
                                ? krambambouliCantus.name
                                : `Bij ${loc.name} vanaf ${pickupStartDate.getDate()}/${pickupStartDate.getMonth() + 1}`}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </form.Field>
                )) ||
                (uniqueDeliveryOptions &&
                  deliveryOption === DeliveryOptionEnum.delivery && (
                    <>
                      <div className={styles.fieldRow}>
                        <h4>Leveroptie</h4>
                        {uniqueDeliveryOptions.map((loc, idx) => {
                          return (
                            <form.Field key={loc.name} name="deliveryZone">
                              {(field) => (
                                <span className={styles.deliveryRow}>
                                  <label htmlFor={`${field.name}-${idx}`}>
                                    <input
                                      id={`${field.name}-${idx}`}
                                      type="radio"
                                      className={styles.radioButton}
                                      name={field.name}
                                      value={loc.name}
                                      required
                                      checked={loc.name === field.state.value}
                                      onChange={() =>
                                        field.handleChange(loc.name)
                                      }
                                    />
                                    {`Levering ${loc.name}`}
                                  </label>
                                  <p>{`€${loc.price.euros},${loc.price.cents === 0 ? "-" : loc.price.cents}`}</p>
                                </span>
                              )}
                            </form.Field>
                          );
                        })}
                      </div>
                      <div className={styles.addressRow}>
                        <div className={styles.fieldRow}>
                          <form.Field name="streetName">
                            {(field) => (
                              <>
                                <label htmlFor={field.name}>Straatnaam</label>
                                <input
                                  id={field.name}
                                  type="text"
                                  value={field.state.value}
                                  name="streetName"
                                  required
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </>
                            )}
                          </form.Field>
                          <form.Field name="streetNumber">
                            {(field) => (
                              <>
                                <label htmlFor={field.name}>Nummer</label>
                                <input
                                  id={field.name}
                                  type="text"
                                  name={field.name}
                                  required
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </>
                            )}
                          </form.Field>
                          <form.Field name="bus">
                            {(field) => (
                              <>
                                <label htmlFor={field.name}>Bus</label>
                                <input
                                  id={field.name}
                                  type="text"
                                  name={field.name}
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </>
                            )}
                          </form.Field>
                        </div>
                        <div className={styles.fieldRow}>
                          <form.Field name="postcode">
                            {(field) => (
                              <>
                                <label htmlFor={field.name}>Postcode</label>
                                <input
                                  id={field.name}
                                  type="number"
                                  name={field.name}
                                  value={field.state.value}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  required
                                />
                              </>
                            )}
                          </form.Field>
                          <form.Field name="city">
                            {(field) => (
                              <>
                                <label htmlFor="city">Stad</label>
                                <input
                                  id="city"
                                  type="text"
                                  required
                                  value={field.state.value}
                                  name="city"
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                />
                              </>
                            )}
                          </form.Field>
                        </div>
                      </div>
                    </>
                  ))
              );
            }}
          </form.Subscribe>
          <form.Subscribe
            selector={(state) => {
              return {
                cart: state.values.cart,
                deliveryOption: state.values.deliveryOption,
                deliveryZone: state.values.deliveryZone,
                postcode: state.values.postcode,
              };
            }}
          >
            {(observable) => {
              let totalCents = observable.cart.reduce((acc, current) => {
                const amount = current.amount;
                if (amount === 0) return acc;
                return (
                  acc +
                  amount * (current.price.euros * 100 + current.price.cents)
                );
              }, 0);
              if (observable.deliveryOption === DeliveryOptionEnum.delivery) {
                const deliveryZone =
                  uniqueDeliveryOptions?.find((l) =>
                    l.ranges.find(
                      (r) =>
                        r.from <= parseInt(observable.postcode) &&
                        r.to >= parseInt(observable.postcode),
                    ),
                  ) ||
                  uniqueDeliveryOptions?.find(
                    (l) => l.name === observable.deliveryZone,
                  );
                if (deliveryZone)
                  totalCents +=
                    deliveryZone.price.euros * 100 + deliveryZone.price.cents;
              }
              const total = fromCents(totalCents);
              return (
                <div className={styles.informationContainer}>
                  <p>
                    Totaalbedrag{" "}
                    <b>{`€${total.euros},${total.cents === 0 ? "-" : total.cents}`}</b>
                  </p>
                  <p>
                    Over te schrijven naar de VATrekening:{" "}
                    <b>BE60 7310 1732 4070</b>
                  </p>
                  <p>
                    Met mededeling:{" "}
                    <b>
                      krambambouli +{" "}
                      <form.Subscribe
                        selector={(state) => {
                          return {
                            firstName: state.values.firstName,
                            lastName: state.values.lastName,
                          };
                        }}
                      >
                        {(names) =>
                          !names.firstName && !names.lastName
                            ? "[Voornaam Achternaam]"
                            : `${names.firstName} ${names.lastName}`
                        }
                      </form.Subscribe>
                    </b>
                  </p>
                </div>
              );
            }}
          </form.Subscribe>
          <div className={styles.submitButtonContainer}>
            <button
              className={`${styles.submitButton} ${!form.state.isValid && styles.submitError}`}
              type="submit"
            >
              Bestellen
            </button>
          </div>
        </div>
      </form>
      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.text}
          onClose={closePopup}
        ></Popup>
      )}
    </div>
  );
}
