import type { ActivityData } from "@/lib/domain/activities";
import { formatDate } from "@/lib/domain/datetime";
import { capitalize } from "@/lib/utils";
import styles from "./ActivityItem.module.css";

type Props = {
  activity: ActivityData;
  locale: string;
};

// Fixed, so the server and the browser render the same date (no hydration mismatch).
const timeZone = "Europe/Brussels";

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** An activity's name, date, time and location: an h3 and a list, without a wrapper. */
export default function ActivityItem({ activity, locale }: Props) {
  const { location } = activity;
  const locationUrl = location.url || mapUrl(location.address || location.name);

  return (
    <>
      <h3>
        {activity.facebook ? (
          <a href={activity.facebook}>{activity.name}</a>
        ) : (
          activity.name
        )}
      </h3>
      <ul className={styles.details}>
        <li>
          {capitalize(
            formatDate(activity.occursAt, locale, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone,
            }),
          )}
        </li>
        <li>
          {formatDate(activity.occursAt, locale, {
            hour: "2-digit",
            minute: "2-digit",
            timeZone,
          })}
        </li>
        <li>
          <a href={locationUrl} target="_blank">
            {location.name}
          </a>
        </li>
      </ul>
    </>
  );
}
