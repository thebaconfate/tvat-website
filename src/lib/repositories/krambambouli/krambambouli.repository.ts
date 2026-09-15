import { database, type DatabaseClient } from "@/lib/infrastructure/database";
import {
  DeliveryOptionEnum,
  type DeliveryZoneData,
  type KrambambouliOrderFormData,
  type KrambambouliProductData,
  type PickupLocationData,
} from "@/lib/domain/krambambouli";
import type { OrderData } from "@/lib/domain/krambambouli/order.types";
import type { Page } from "@/lib/domain/page/page.types";
import type { QueryResult } from "pg";
import { Repository } from "../repository";
import z4 from "zod/v4";
import { orderSchema } from "@/lib/domain/krambambouli/order.schema";

type CustomerDetails = {
  email: string;
  firstName: string;
  lastName: string;
};

type OrderQueryResult = {
  id: string;
  firstName: string;
  lastName: string;
  orderNumber: number;
  email: string;
  deliveryOption: DeliveryOptionEnum;
  cart: {
    productId: number;
    amount: number;
    productName: string;
    price: number;
  }[];
  totalOwed: number;
  paid: boolean;
  received: boolean;
  createdAt: Date;
  totalElements: number;
  deliveryFee: number;
  pickupLocationId: number;
  pickupLocationName: string;
};

export class KrambambouliRepository extends Repository {
  async isFormEnabled(): Promise<boolean> {
    const sql = `
        SELECT c.config_value AS "configValue"
        FROM config c WHERE c.config_key ILIKE 'krambambouli_form_enabled'
        `;
    const result: QueryResult<{ configValue: boolean }> =
      await this.db.query(sql);
    const [row] = result.rows;
    return row.configValue ?? false;
  }

  async findActiveProducts(): Promise<KrambambouliProductData[] | null> {
    const sql = `
    SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        p.price as "price"
    FROM products p
    WHERE p.active = TRUE
        AND p.category ILIKE '%krambambouli%'
    ORDER BY p.id DESC
    `;
    const result: QueryResult<KrambambouliProductData> =
      await this.db.query(sql);
    return result.rows;
  }

  async findActiveDeliveryZones(
    db: DatabaseClient = database,
  ): Promise<DeliveryZoneData[] | null> {
    const sql = `
    SELECT
        dz.id,
        dz.name,
        dz.postal_code_to AS "postalCodeTo",
        dz.postal_code_from AS "postalCodeFrom",
        dz.price AS "price"
    FROM krambambouli_delivery_zones dz
    WHERE dz.active = TRUE
    `;
    const result: QueryResult<DeliveryZoneData> = await db.query(sql);
    return result.rows;
  }
  async findActivePickupLocations(
    db: DatabaseClient = database,
  ): Promise<PickupLocationData[] | null> {
    const sql = `
    SELECT
        p.id,
        p.name
    FROM krambambouli_pickup_locations p
    WHERE p.active = TRUE
    `;
    const result: QueryResult<PickupLocationData> = await db.query(sql);
    return result.rows;
  }

  async createOrder(order: KrambambouliOrderFormData): Promise<OrderData> {
    const sql = `
      WITH

      upsert_customer AS (
          INSERT INTO customers (email, first_name, last_name)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO UPDATE
            SET first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name
          RETURNING id as customer_id
      ),

      cart AS (
          SELECT
            input.product_id,
            input.amount,
            p.price,
            (input.amount * p.price) as total_price
          FROM UNNEST($4::int[], $5::int[]) AS input(product_id, amount)
          JOIN products p ON p.id = input.product_id
      ),

      delivery_fee_lookup AS (
          SELECT COALESCE(
              (
                SELECT price
                FROM krambambouli_delivery_zones
                WHERE active = true
                  AND $6 = 'delivery'
                  AND $11::int BETWEEN postal_code_from AND postal_code_to
                ORDER BY price ASC
                LIMIT 1
              ),
              0
          ) AS fee
      ),

      cart_total AS (
          SELECT
            SUM(c.total_price) AS items_total,
            d.fee AS delivery_fee,
            (SUM(c.total_price) + d.fee) AS total_owed
          FROM cart c, delivery_fee_lookup d
          GROUP BY d.fee
      ),

      new_order AS (
          INSERT INTO krambambouli_orders (
              customer_id,
              delivery_option,
              pickup_location_id,
              delivery_fee,
              total_owed
          )
          SELECT
            c.customer_id,
            $6::varchar,
            CASE WHEN $6 = 'pickup' THEN $7::int ELSE NULL END,
            ct.delivery_fee,
            ct.total_owed
          FROM upsert_customer c, cart_total ct
          RETURNING *
      ),

      new_order_items AS (
          INSERT INTO krambambouli_order_items (order_id, product_id, amount, price)
          SELECT
            o.id,
            c.product_id,
            c.amount,
            c.price
          FROM cart c, new_order o
          RETURNING *
      ),

      new_delivery_address AS (
          INSERT INTO krambambouli_delivery_locations (
              order_id,
              street_name,
              house_number,
              bus,
              postal_code,
              city
          )
          SELECT
            o.id, $8, $9, $10, $11, $12
          FROM new_order o
          WHERE $6 = 'delivery'
          RETURNING *
      )

      SELECT
        o.id,
        o.order_number AS "orderNumber",
        c.first_name AS "firstName",
        c.last_name AS "lastName",
        c.email,
        o.delivery_option AS "deliveryOption",
        o.pickup_location_id AS "pickupLocationId",
        o.delivery_fee AS "deliveryFee",
        o.total_owed AS "totalOwed",
        o.paid,
        o.received,
        o.created_at AS "createdAt",
        da.street_name AS "streetName",
        da.house_number AS "houseNumber",
        da.bus AS "bus",
        da.postal_code AS "postalCode",
        da.city AS "city",
        pl.name as "pickupLocationName",
        COALESCE(
            json_agg(
                json_build_object(
                    'productId', p.id,
                    'productName', p.name,
                    'amount', oi.amount,
                    'price', oi.price
                )
            ) FILTER (WHERE oi.product_id IS NOT NULL),
            '[]'::json
        ) AS orders
        FROM new_order o
        JOIN customers c ON c.id = o.customer_id
        LEFT JOIN new_order_items oi ON oi.order_id = o.id
        LEFT JOIN products p ON p.id = oi.product_id
        LEFT JOIN new_delivery_address da ON da.order_id = o.id
        LEFT JOIN krambambouli_pickup_locations pl ON pl.id = o.pickup_location_id
        GROUP BY
            o.id,
            o.order_number,
            c.first_name,
            c.last_name,
            c.email,
            o.delivery_option,
            o.pickup_location_id,
            pl.name,
            o.delivery_fee,
            o.total_owed,
            o.paid,
            o.received,
            o.created_at,
            da.street_name,
            da.house_number,
            da.bus,
            da.postal_code,
            da.city;
      `;
    const [productIds, productAmounts] = order.cart.reduce(
      ([pIds, pAmts]: [number[], number[]], item) => {
        pAmts.push(item.amount);
        pIds.push(item.productId);
        return [pIds, pAmts];
      },
      [[], []],
    );
    const isPickup = order.deliveryOption == DeliveryOptionEnum.pickup;
    const params = [
      order.email,
      order.firstName,
      order.lastName,
      productIds,
      productAmounts,
      order.deliveryOption,
      isPickup ? order.pickupLocationId : null,
      isPickup ? null : order.streetName,
      isPickup ? null : order.houseNumber,
      isPickup ? null : order.bus,
      isPickup ? null : order.postalCode,
      isPickup ? null : order.city,
    ];
    const result = await this.db.query<OrderData>(sql, params);
    console.log(result.rows);
    return orderSchema.parse(result.rows[0]);
  }

  async getOrders(
    pageNumber: number = 1,
    pageSize: number = 100,
  ): Promise<Page<OrderData>> {
    // FIX: check the sql, might be outdated with the orderSchema refactor
    pageNumber = Math.max(1, pageNumber);
    pageSize = Math.max(1, pageSize);
    const offset = (pageNumber - 1) * pageSize;
    const sql = `
      WITH paginated_orders AS (
          SELECT
            o.id,
            o.order_number,
            o.total_owed,
            o.paid,
            o.received,
            o.created_at
            COUNT(*) OVER() as total_elements
          FROM krambambouli_orders o
          ORDER BY o.created_at DESC
          LIMIT $1 OFFSET $2
      )

      SELECT
        po.id as id,
        c.first_name as "firstName",
        c.last_name as "lastName",
        po.order_number as "orderNumber",
        c.email as email,
        COALESCE(
            json_agg(
                json_build_object(
                    'orderId', oi.order_id,
                    'productId', oi.product_id,
                    'amount', oi.amount,
                    'productName', p.name,
                )
            ) FILTER (WHERE oi.order_id is NOT NULL),
            '[]'::json
        ) AS cart,
        po.total_owed AS "totalOwed",
        po.paid AS paid,
        po.received AS received,
        po.created_at as "createdAt",
        po.total_elements as "totalElements"
      FROM paginated_orders po
      JOIN customers c on c.id = po.customer_id
      LEFT JOIN krambambouli_order_items oi ON oi.order_id = po.id
      LEFT JOIN products p ON p.id = oi.product_id
      GROUP BY
        po.id,
        c.first_name,
        c.last_name,
        po.order_number,
        c.email,
        po.total_owed,
        po.paid,
        po.received,
        po.created_at,
        po.total_elements
      ORDER BY po.created_at DESC;
      `;
    const result = await this.db.query<OrderQueryResult>(sql, [
      pageSize,
      offset,
    ]);
    const rows = result.rows;
    const totalElements = rows.length > 0 ? Number(rows[0].totalElements) : 0;
    const totalPages = Math.ceil(totalElements / pageSize);
    const content: OrderData[] = z4.array(orderSchema).parse(rows);
    return {
      page: { size: 0, number: 0, totalElements: 0, totalPages: totalPages },
      content: content,
    };
  }
}
