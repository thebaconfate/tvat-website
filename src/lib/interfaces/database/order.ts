import type { RowDataPacket } from "mysql2/promise";

export interface OrderInterface extends RowDataPacket {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  euros: number;
  cents: number;
  isPaid: boolean;
  isFulfilled: boolean;
  pickupLocationId: number | null;
  deliveryZoneId: number | null;
  deliveryAddressId: number | null;
  createdAt: Date;
}
