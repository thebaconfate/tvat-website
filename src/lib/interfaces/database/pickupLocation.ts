import type { RowDataPacket } from "mysql2";

export interface pickupLocationInterface extends RowDataPacket {
  id: number;
  description: string;
}
