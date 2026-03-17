import type { ActivityData } from "@/lib/domain/activities";
import { formatDate } from "@/lib/domain/datetime";
import { capitalize } from "@/lib/utils";

type Props = {
  activity: ActivityData;
  locale: string;
};
export default function Activity({ activity, locale }: Props) {
  function createMapUrl(location: string) {
    const query = encodeURIComponent(location);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
  return (
    <>
      <h3>
        {activity.facebook ? (
          <a href={activity.facebook}>{activity.name}</a>
        ) : (
          activity.name
        )}
      </h3>
      <li>
        <ul>
          <li>
            {capitalize(
              formatDate(new Date(activity.date), locale, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }),
            )}
          </li>
          <li>{activity.time}</li>
          <li>
            <a
              href={
                activity.location.url
                  ? activity.location.url
                  : activity.location.address
                    ? createMapUrl(activity.location.address)
                    : createMapUrl(activity.location.name)
              }
              target="_blank"
            >
              {activity.location.name}
            </a>
          </li>
        </ul>
      </li>
    </>
  );
}
