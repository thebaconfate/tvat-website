import type { ActivityData } from "@/lib/domain/activities";

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
}

export const activityService = new ActivityService();
