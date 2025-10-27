import type { RowDataPacket } from "mysql2";

export interface DeliveryZoneInterface extends RowDataPacket {
  id: number;
  areaStart: number;
  areaEnd: number;
  name: string;
  euros: number;
  cents: number;
}
