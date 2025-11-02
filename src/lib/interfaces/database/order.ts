import type { RowDataPacket } from "mysql2/promise";

export interface OrderInterface extends RowDataPacket {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  owed: { euros: number; cents: number };
  paid: boolean;
  fulfilled: boolean;
  pickupLocationId: number | null;
  deliveryZoneId: number | null;
  deliveryAddressId: number | null;
  createdAt: Date;
  orders: { productId: number; amount: number }[];
}
