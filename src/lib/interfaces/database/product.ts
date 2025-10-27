import type { RowDataPacket } from "mysql2/promise";

export interface ProductInterface extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: {
    cents: number;
    euros: number;
  };
}
