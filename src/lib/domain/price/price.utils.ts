import type { PriceData } from "./price.types";

export function totalPrice(listOfPrices: PriceData[]): PriceData {
  const totalCents = listOfPrices.reduce(
    (acc, price) => price.euros * 100 + acc + price.cents,
    0,
  );
  return fromCents(totalCents);
}

export function normalize(price: PriceData) {
  const total = price.euros * 100 + price.cents;
  return {
    euros: Math.trunc(total / 100),
    cents: Math.abs(total % 100),
  };
}

export function fromCents(totalCents: number) {
  return {
    euros: Math.trunc(totalCents / 100),
    cents: Math.abs(totalCents % 100),
  };
}
