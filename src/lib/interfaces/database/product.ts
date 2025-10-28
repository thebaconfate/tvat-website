import type { RowDataPacket } from "mysql2/promise";
import type { PriceInterface } from "./price";

export interface ProductInterface extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: PriceInterface;
}
