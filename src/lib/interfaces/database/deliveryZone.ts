import type { RowDataPacket } from "mysql2";
import type { PriceInterface } from "./price";

export interface DeliveryZoneInterface extends RowDataPacket {
  area: string;
  ranges: { areaStart: number; areaEnd: number }[];
  euros: PriceInterface;
}
