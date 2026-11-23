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

const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone,
});

/** The BSK stores date-only activities at midnight, so 00:00 means "no time given". */
function hasTime(date: Date) {
  return clock.format(date) !== "00:00";
}

function mapUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** An activity's name, date, time and location: an h3 and a list, without a wrapper. */
export default function ActivityItem({ activity, locale }: Props) {
  const { location } = activity;

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
        {hasTime(activity.occursAt) && (
          <li>
            {formatDate(activity.occursAt, locale, {
              hour: "2-digit",
              minute: "2-digit",
              timeZone,
            })}
          </li>
        )}
        {location.name && (
          <li>
            <a
              href={
                location.url || mapUrl(location.address || location.name)
              }
              target="_blank"
            >
              {location.name}
            </a>
          </li>
        )}
      </ul>
    </>
  );
}
