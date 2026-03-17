class ActivityService {
  constructor() {}

  async getFutureActivities() {
    const today = new Date();
    const [day, month, year] = [
      today.getDate(),
      today.getMonth(),
      today.getFullYear(),
    ];
    console.log([day, month, year]);
    return [];
  }
}

export const activityService = new ActivityService();
