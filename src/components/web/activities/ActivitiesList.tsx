import { useList } from "@/components/shared/hooks/useList";
import Input from "@/components/shared/Input";
import LoadError from "@/components/shared/LoadError";
import Pagination from "@/components/shared/Pagination";
import { activitiesApi } from "@/lib/client/activities/activities.api";
import type { ActivityData, ActivityFilters } from "@/lib/domain/activities";
import type { Page } from "@/lib/domain/page";
import { fromDateInput, httpErrorMessage, toDateInput } from "@/lib/utils";
import ActivityItem from "./ActivityItem";
import styles from "./ActivitiesList.module.css";

type Props = {
  page: Page<ActivityData>;
  initialFilters: ActivityFilters;
  locale: string;
};

export default function ActivitiesList(props: Props) {
  const {
    items: activities,
    filters,
    setFilters,
    loading,
    error,
    refetch,
    page,
    totalPages,
    next,
    prev,
  } = useList(activitiesApi, {
    initialPage: props.page,
    initialFilters: props.initialFilters,
  });

  const setFilter = <Key extends keyof ActivityFilters>(
    key: Key,
    value: ActivityFilters[Key],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <>
      <div className={styles.filters} role="search">
        <Input
          placeholder="Naam"
          aria-label="Naam"
          type="search"
          value={filters.name ?? ""}
          onChange={(e) => setFilter("name", e.target.value || undefined)}
        />
        <Input
          placeholder="Locatie"
          aria-label="Locatie"
          type="search"
          value={filters.location ?? ""}
          onChange={(e) => setFilter("location", e.target.value || undefined)}
        />
        <span className={styles.dates}>
          <Input
            type="date"
            aria-label="Vanaf"
            value={toDateInput(filters.fromDate)}
            onChange={(e) =>
              setFilter("fromDate", fromDateInput(e.target.value))
            }
          />
          -
          <Input
            type="date"
            aria-label="Tot en met"
            value={toDateInput(filters.toDate)}
            onChange={(e) => setFilter("toDate", fromDateInput(e.target.value))}
          />
        </span>
      </div>

      {error != null && (
        <LoadError
          message={httpErrorMessage(error, "Activiteiten laden mislukt.")}
          onRetry={refetch}
        />
      )}

      <div
        className={`${styles.list} ${loading ? styles.loading : ""}`}
        aria-busy={loading}
      >
        {activities.length === 0 && !loading ? (
          <p>Geen activiteiten gevonden.</p>
        ) : (
          activities.map((activity) => (
            <article key={activity.id} className={styles.item}>
              <ActivityItem activity={activity} locale={props.locale} />
            </article>
          ))
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
