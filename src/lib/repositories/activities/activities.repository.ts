import {
  activitySchema,
  type ActivityData,
  type ActivityFilters,
} from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import z from "zod/v4";
import { Repository } from "../repository";

export class ActivitiesRepository extends Repository {
  /** A page of activities, soonest first. Dates filter on whole UTC days. */
  async getActivities(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters: ActivityFilters = {},
  ): Promise<Page<ActivityData>> {
    pageNumber = Math.max(1, pageNumber);
    pageSize = Math.max(1, pageSize);

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.name) {
      params.push(`%${filters.name}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    if (filters.location) {
      params.push(`%${filters.location}%`);
      conditions.push(`location_name ILIKE $${params.length}`);
    }

    if (filters.fromDate) {
      const startOfDay = new Date(filters.fromDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      params.push(startOfDay.toISOString());
      conditions.push(`occurs_at >= $${params.length}::timestamptz`);
    }

    if (filters.toDate) {
      const endOfDay = new Date(filters.toDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      params.push(endOfDay.toISOString());
      conditions.push(`occurs_at <= $${params.length}::timestamptz`);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    params.push(pageSize, (pageNumber - 1) * pageSize);

    // COUNT(*) OVER () counts every matching row, before LIMIT and OFFSET apply.
    const sql = `
      SELECT
        id,
        name,
        occurs_at AS "occursAt",
        json_build_object(
          'name', location_name,
          'url', location_url,
          'address', location_address
        ) AS location,
        facebook_url AS facebook,
        COUNT(*) OVER () AS "totalElements"
      FROM activities
      ${where}
      ORDER BY occurs_at ASC, id ASC
      LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await this.db.query<{ totalElements: string }>(
      sql,
      params,
    );
    const totalElements = rows.length > 0 ? Number(rows[0].totalElements) : 0;
    const content = z.array(activitySchema).parse(rows);
    return {
      content,
      page: {
        size: content.length,
        number: pageNumber,
        totalElements,
        totalPages: Math.ceil(totalElements / pageSize),
      },
    };
  }
}
