import { ArrowRight } from "lucide-react";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import StatusBadge from "../ui/StatusBadge";
import DateTile from "../ui/DateTile";
import { dayjs, titleCase } from "../../lib/format";

export const holidayStatus = (h) => {
  const today = dayjs();
  if (today.isBefore(dayjs(h.startDate))) return "upcoming";
  if (today.isAfter(dayjs(h.endDate))) return "passed";
  return "ongoing";
};

const statusTone = { upcoming: "info", ongoing: "success", passed: "neutral" };
const statusLabel = { upcoming: "Upcoming", ongoing: "Ongoing", passed: "Past" };

// Shared by the student list and the teacher management view (which passes
// `actions`).
const HolidayCard = ({ holiday, actions }) => {
  const status = holidayStatus(holiday);
  const days = dayjs(holiday.endDate).diff(holiday.startDate, "day") + 1;
  return (
    <Card interactive className={`flex flex-col p-5 ${status === "passed" ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-4">
        <DateTile date={holiday.startDate} color={status === "passed" ? "sky" : status === "ongoing" ? "emerald" : "rose"} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink">{titleCase(holiday.title)}</h3>
            <StatusBadge tone={statusTone[status]}>{statusLabel[status]}</StatusBadge>
          </div>
          <p className="mt-0.5 text-xs text-ink-3">{dayjs(holiday.startDate).format("dddd")}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 flex-1 text-[13px] leading-5 text-ink-2">{holiday.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-ink-2">
          {dayjs(holiday.startDate).format("MMM D")}
          <ArrowRight className="h-3 w-3 text-ink-3" aria-hidden="true" />
          {dayjs(holiday.endDate).format("MMM D, YYYY")}
          <span className="font-normal text-ink-3">
            · {days} {days === 1 ? "day" : "days"}
          </span>
        </p>
        {actions}
      </div>
    </Card>
  );
};

export const HolidaySkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map((i) => (
      <Card key={i} className="p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-2 h-3 w-3/4" />
        <Skeleton className="mt-6 h-3 w-1/2" />
      </Card>
    ))}
  </div>
);

export default HolidayCard;
