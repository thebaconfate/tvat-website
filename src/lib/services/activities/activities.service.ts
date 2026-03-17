import { database } from "@/lib/database";
import type { ActivityData } from "@/lib/domain/activities";
import type { URLSearchParams } from "url";

class ActivityService {
  constructor() {}

  async getFutureActivities(): Promise<ActivityData[]> {
    const today = new Date();
    const [day, month, year] = [
      today.getDate(),
      today.getMonth(),
      today.getFullYear(),
    ];
    console.log([day, month, year]);
    return [
      {
        name: "Krambambouli cantus",
        date: "2026-12-16",
        time: "20:00",
        location: {
          name: "BOJ-raad",
          url: "https://www.google.com/maps/place/BOJ-raad+VZW/@50.8841037,4.3072629,17z/data=!4m14!1m7!3m6!1s0x47c3c17b8565f52f:0x835edf1d625ecb63!2sBOJ-raad+VZW!8m2!3d50.8841037!4d4.3072629!16s%2Fg%2F11b6hzvs0b!3m5!1s0x47c3c17b8565f52f:0x835edf1d625ecb63!8m2!3d50.8841037!4d4.3072629!16s%2Fg%2F11b6hzvs0b?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
        },
      },
      {
        name: "Rouge-et-vert cantus",
        date: "2026-09-24",
        time: "20:00",
        location: {
          name: "BSG Zaal",
        },
      },
    ];
  }

  async fetchActivityPage(urlSearchParams: URLSearchParams) {
    const page = parseInt(urlSearchParams.get("page") ?? "1");
    const size = parseInt(urlSearchParams.get("size") ?? "10");
    const offset = (page - 1) * size;

    const filters: string[] = [];
    const values: any[] = [];

    if (urlSearchParams.has("nameLike")) {
      values.push(`%${urlSearchParams.get("nameLike")}%`);
      filters.push(`name ILIKE $${values.length}`);
    } else if (urlSearchParams.has("name")) {
      values.push(urlSearchParams.get("name"));
      filters.push(`name = $${values.length}`);
    }

    if (urlSearchParams.has("dateBefore")) {
      values.push(`${urlSearchParams.get("dateBefore")}`);
      filters.push(`date <= $${values.length}`);
    }

    if (urlSearchParams.has("dateAfter")) {
      values.push(`${urlSearchParams.get("dateAfter")}`);
      filters.push(`date >= $${values.length}`);
    }
    if (urlSearchParams.has("location")) {
      values.push(`%${urlSearchParams.get("location")}%`);
      filters.push(`location_name ILIKE $${values.length}`);
    }

    const whereClause =
      filters.length > 0 ? `WHERE ${filters.join("AND ")}` : "";
    const countQuery = `SELECT COUNT(*) AS total from activities ${whereClause}`;
    const query = `
    SELECT *,
        COUNT(*) OVER() as total_count
    FROM activities
    ${whereClause}
    ORDER BY
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

    const [countResult, contentResult] = await Promise.all([
      database.query(countQuery),
      database.query<ActivityData[]>(query, [...values, size, offset]),
    ]);
    console.log(countResult);
    console.log(contentResult);
  }
}

export const activityService = new ActivityService();
