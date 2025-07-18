export interface PriceInterface {
  euros: number;
  cents?: number;
}

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
    const postComma = this.cents === 0 ? "-" : `${this.cents}`;
    const result = `€${this.euros},` + postComma;
    return result;
  }
}

export interface ProductInterface {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  price: PriceInterface;
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

export class PickUpLocation {
  name: string;
  area: string;

  constructor(name: string, area: string) {
    this.name = name;
    this.area = area;
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
}
