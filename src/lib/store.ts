import type { DeliveryZoneInterface } from "./interfaces/database/deliveryZone";
import type { PickupLocationInterface } from "./interfaces/database/pickupLocation";
import type { PriceInterface } from "./interfaces/database/price";
import type { ProductInterface } from "./interfaces/database/product";

export class Price {
  euros: number;
  cents: number;

  constructor(euros: number, cents: number = 0) {
    this.euros = euros + Math.floor(cents / 100);
    this.cents = cents % 100;
  }

  add(price: Price) {
    return new Price(this.euros + price.euros, this.cents + price.cents);
  }

  mult(scalar: number) {
    return new Price(this.euros * scalar, this.cents * scalar);
  }

  static from(price: PriceInterface) {
    return new Price(price.euros, price.cents);
  }

  toString(): string {
    const postComma =
      this.cents === 0 || isNaN(this.cents) ? "-" : `${this.cents}`;
    const result = `€${isNaN(this.euros) ? 0 : this.euros},` + postComma;
    return result;
  }
}

export class Product {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: Price;

  constructor(
    id: number,
    name: string,
    price: Price,
    description?: string,
    imageUrl?: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
  }

  static from(product: ProductInterface) {
    return new Product(
      product.id,
      product.name,
      Price.from(product.price),
      product.description,
      product.imageUrl,
    );
  }
}

export class PickupLocation {
  id: number;
  description: string;

  constructor(id: number, description: string) {
    this.id = id;
    this.description = description;
  }

  static from(pickupLocation: PickupLocationInterface) {
    return new PickupLocation(pickupLocation.id, pickupLocation.description);
  }
}

export class Range {
  lower: number;
  upper: number;
  constructor(lower: number, upper: number) {
    this.lower = lower;
    this.upper = upper;
  }
}

export class DeliveryLocation {
  area: string;
  range: Range[];
  price: Price;

  constructor(area: string, range: Range[], price: Price) {
    this.area = area;
    this.range = range;
    this.price = price;
  }

  static from(deliveryLocation: DeliveryZoneInterface) {
    return new DeliveryLocation(
      deliveryLocation.area,
      deliveryLocation.ranges.map((r) => new Range(r.areaStart, r.areaEnd)),
      Price.from(deliveryLocation.price),
    );
  }
}
