import {
  activitySchema,
  type ActivityData,
  type ActivityFilters,
} from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import z from "zod/v4";
import { Repository } from "../repository";

/** An activity from the BSK calendar, ready to store. */
export type ImportedBSKActivity = {
  bskId: string;
  name: string;
  localTime: string;
  place: string | null;
  url: string | null;
  bskUpdatedAt: string;
};

export class ActivitiesRepository extends Repository {
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

  /** `fromDay`: the first day (`yyyy-mm-dd`, Brussels) `activities` covers; earlier ones are left alone. */
  async syncBskActivities(
    activities: ImportedBSKActivity[],
    fromDay: string,
  ): Promise<{ changed: number; removed: number }> {
    const sql = `
      WITH incoming AS (
        SELECT *
        FROM UNNEST(
          $1::text[], $2::text[], $3::timestamp[], $4::text[], $5::text[],
          $6::timestamptz[]
        ) AS i(bsk_id, name, local_time, place, url, bsk_edited_at)
      ),
      changed AS (
        INSERT INTO activities (bsk_id, name, occurs_at, location_name, facebook_url, updated_at)
        SELECT bsk_id, name, local_time AT TIME ZONE 'Europe/Brussels', place, url, bsk_edited_at
        FROM incoming
        ON CONFLICT (bsk_id) DO UPDATE SET
          name = EXCLUDED.name,
          occurs_at = EXCLUDED.occurs_at,
          location_name = EXCLUDED.location_name,
          facebook_url = EXCLUDED.facebook_url,
          updated_at = EXCLUDED.updated_at
        WHERE EXCLUDED.updated_at > activities.updated_at
          AND (activities.name, activities.occurs_at, activities.location_name, activities.facebook_url)
          IS DISTINCT FROM
              (EXCLUDED.name, EXCLUDED.occurs_at, EXCLUDED.location_name, EXCLUDED.facebook_url)
        RETURNING 1
      ),
      removed AS (
        DELETE FROM activities a
        WHERE a.bsk_id IS NOT NULL
          AND a.occurs_at >= $7::date::timestamp AT TIME ZONE 'Europe/Brussels'
          AND NOT EXISTS (SELECT 1 FROM incoming i WHERE i.bsk_id = a.bsk_id)
        RETURNING 1
      )
      SELECT
        (SELECT COUNT(*) FROM changed) AS changed,
        (SELECT COUNT(*) FROM removed) AS removed`;
    const { rows } = await this.db.query<{ changed: string; removed: string }>(
      sql,
      [
        activities.map((a) => a.bskId),
        activities.map((a) => a.name),
        activities.map((a) => a.localTime),
        activities.map((a) => a.place),
        activities.map((a) => a.url),
        activities.map((a) => a.bskUpdatedAt),
        fromDay,
      ],
    );
    return {
      changed: Number(rows[0].changed),
      removed: Number(rows[0].removed),
    };
  }
}
