import React from "react";
import { CalendarRange } from "lucide-react";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import PageHeader from "../../ui/PageHeader";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import AsyncContent from "../../ui/AsyncContent";
import HolidayCard, { HolidaySkeleton, holidayStatus } from "../../dashboard/HolidayCard";

const order = { ongoing: 0, upcoming: 1, passed: 2 };

const Holiday = () => {
  const { data: holidays = [], loading, error, reload } = useAsync(() => api.get("/holidays").then(({ data }) => data.data || []), []);

  const sorted = [...holidays].sort((a, b) => {
    const sa = order[holidayStatus(a)];
    const sb = order[holidayStatus(b)];
    if (sa !== sb) return sa - sb;
    return sa === 2 ? new Date(b.startDate) - new Date(a.startDate) : new Date(a.startDate) - new Date(b.startDate);
  });

  return (
    <div className="space-y-4">
      <PageHeader
        icon={CalendarRange}
        color="rose"
        title="Holidays"
        description="Academic breaks and observances announced by your institution."
      />

      <AsyncContent
        loading={loading}
        error={error}
        onRetry={reload}
        loadingLabel="Loading holidays"
        errorTitle="We couldn't load holidays"
        skeleton={<HolidaySkeleton />}
      >
        {sorted.length === 0 ? (
          <Card>
            <EmptyState
              icon={CalendarRange}
              title="No holidays announced"
              description="Check back later for updates to the academic calendar."
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((holiday) => (
              <HolidayCard key={holiday._id} holiday={holiday} />
            ))}
          </div>
        )}
      </AsyncContent>
    </div>
  );
};

export default Holiday;
