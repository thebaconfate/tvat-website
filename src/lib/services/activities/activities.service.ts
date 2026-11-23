import type { ActivityData, ActivityQuery } from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import { ActivitiesRepository } from "@/lib/repositories/activities";

class ActivityService {
  constructor(
    private readonly repository: ActivitiesRepository = new ActivitiesRepository(),
  ) {}

  async getActivities(
    query: ActivityQuery = { page: 1 },
  ): Promise<Page<ActivityData>> {
    const { page, pageSize, ...filters } = query;
    return this.repository.getActivities(page, pageSize, filters);
  }
}

export const activityService = new ActivityService();
