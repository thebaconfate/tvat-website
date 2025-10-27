import type { RowDataPacket } from "mysql2";

export interface PickupLocationInterface extends RowDataPacket {
  id: number;
  description: string;
}
