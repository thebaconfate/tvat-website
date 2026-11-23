import { activityQuerySchema, activitySchema } from "@/lib/domain/activities";
import { API_ROUTES } from "@/lib/routes";
import { createListApi } from "../rest-api";

export const activitiesApi = createListApi({
  url: API_ROUTES.ACTIVITIES.url,
  itemSchema: activitySchema,
  querySchema: activityQuerySchema,
});
