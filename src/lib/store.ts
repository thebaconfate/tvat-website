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

  static fromObj(price: PriceInterface) {
    return new Price(price.euros, price.cents);
  }
}

export interface ProductInterface {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  euros: number;
  cents: number;
}

export class Product {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: Price;

  constructor(
    id: number,
    name: string,
    price: Price,
    description: string = "",
    imageUrl: string | null = null,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.imageUrl = imageUrl;
  }
}
