import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, ClipboardList, Search } from "lucide-react";
import store from "../../../zustand/loginStore";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { dayjs, titleCase } from "../../../lib/format";
import { WEEKDAYS, buildMonth, cursorFor, dateKey, formatBs, parseInSystem, shiftCursor } from "../../../lib/calendar";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import SegmentedControl from "../../ui/SegmentedControl";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState, ErrorState } from "../../ui/States";
import { Skeleton } from "../../ui/Skeleton";
import { colors as palette } from "../../ui/colors";

const SYSTEM_KEY = "calendar-system";
const readSystem = () => {
  try {
    return localStorage.getItem(SYSTEM_KEY) === "ad" ? "ad" : "bs";
  } catch {
    return "bs";
  }
};

const eventStyle = {
  holiday: { color: "rose", icon: CalendarRange, label: "Holiday" },
  assignment: { color: "amber", icon: ClipboardList, label: "Assignment due" },
  submitted: { color: "emerald", icon: ClipboardList, label: "Submitted" },
};

const EventPill = ({ event }) => {
  const c = palette[eventStyle[event.type].color];
  return (
    <span className={`flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-4 ${c.tile}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} aria-hidden="true" />
      <span className="truncate">{event.title}</span>
    </span>
  );
};

const EventRow = ({ event, showDate, onOpen }) => {
  const style = eventStyle[event.type];
  const Icon = style.icon;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-brand/[0.04]"
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${palette[style.color].tile}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-ink">{event.title}</span>
          <span className="block truncate text-xs text-ink-3">
            {style.label}
            {event.meta ? ` · ${event.meta}` : ""}
            {showDate ? ` · ${dayjs(event.date).format("MMM D")} · ${formatBs(event.date, false)}` : ""}
          </span>
        </span>
      </button>
    </li>
  );
};

const StudentCalendar = () => {
  const navigate = useNavigate();
  const { loginUserData } = store((state) => state);
  const [system, setSystemState] = useState(readSystem);
  const [cursor, setCursor] = useState(() => cursorFor(readSystem()));
  const [selected, setSelected] = useState(() => dayjs().startOf("day"));
  const [searchDate, setSearchDate] = useState("");
  const [direction, setDirection] = useState(0);

  const { data, loading, error, reload } = useAsync(async () => {
    const [holidays, assignments] = await Promise.allSettled([api.get("/holidays"), api.get("/assignments")]);
    if (holidays.status === "rejected" && assignments.status === "rejected") throw holidays.reason;
    return {
      holidays: holidays.status === "fulfilled" ? holidays.value.data?.data || [] : [],
      assignments: assignments.status === "fulfilled" ? assignments.value.data?.data || [] : [],
    };
  }, []);

  // AD date key → events on that day
  const events = useMemo(() => {
    const map = new Map();
    const add = (key, ev) => map.set(key, [...(map.get(key) || []), ev]);
    (data?.holidays || []).forEach((h) => {
      const end = dayjs(h.endDate).startOf("day");
      for (let d = dayjs(h.startDate).startOf("day"); !d.isAfter(end); d = d.add(1, "day")) {
        add(dateKey(d), { id: `h-${h._id}-${dateKey(d)}`, type: "holiday", title: titleCase(h.title), date: d });
      }
    });
    (data?.assignments || []).forEach((a) => {
      const done = a.submissions?.some((s) => s.student === loginUserData?._id);
      add(dateKey(a.dueDate), {
        id: `a-${a._id}`,
        type: done ? "submitted" : "assignment",
        title: titleCase(a.title),
        date: dayjs(a.dueDate),
        meta: titleCase(a.subject?.name),
      });
    });
    return map;
  }, [data, loginUserData?._id]);

  const month = useMemo(() => buildMonth(system, cursor), [system, cursor]);
  const todayKey = dateKey(dayjs());
  const selectedEvents = events.get(dateKey(selected)) || [];
  const upcoming = useMemo(
    () =>
      [...events.values()]
        .flat()
        .filter((e) => !dayjs(e.date).isBefore(dayjs().startOf("day")))
        // One row per holiday rather than one per day of it.
        .filter((e, i, arr) => e.type !== "holiday" || arr.findIndex((x) => x.type === "holiday" && x.title === e.title) === i)
        .sort((a, b) => a.date - b.date)
        .slice(0, 6),
    [events],
  );

  const setSystem = (next) => {
    setSystemState(next);
    setDirection(0);
    setCursor(cursorFor(next, selected));
    try {
      localStorage.setItem(SYSTEM_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const go = (delta) => {
    setDirection(delta);
    setCursor((c) => shiftCursor(c, delta));
  };

  const goTo = (date) => {
    setDirection(0);
    setSelected(date);
    setCursor(cursorFor(system, date));
  };

  const openEvent = (e) => navigate(e.type === "holiday" ? "/studentdashboard/holidays" : "/studentdashboard/assignments");
  const selectedBs = formatBs(selected, false).split(" ");

  const navButton =
    "focus-ring inline-flex h-9 w-9 items-center justify-center rounded-xl text-ink-2 hover:bg-brand/[0.08] hover:text-brand";

  return (
    <div className="space-y-4">
      <PageHeader
        icon={CalendarDays}
        color="sky"
        title="Calendar"
        description="Holidays and assignment deadlines, in Bikram Sambat or Gregorian dates."
        actions={
          <>
            <SegmentedControl
              label="Calendar system"
              size="md"
              value={system}
              onChange={setSystem}
              options={[
                { value: "bs", label: "BS · बि.सं." },
                { value: "ad", label: "AD" },
              ]}
            />
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const d = parseInSystem(system, searchDate);
                if (d) goTo(d);
              }}
            >
              <label className="relative">
                <span className="sr-only">Jump to date ({system.toUpperCase()}, YYYY-MM-DD)</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                <input
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  placeholder={`${system.toUpperCase()} YYYY-MM-DD`}
                  inputMode="numeric"
                  className="focus-ring h-10 w-44 rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus-visible:ring-offset-0"
                />
              </label>
              <Button type="submit">Go</Button>
            </form>
          </>
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr),340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-[20px] font-bold tracking-[-0.025em] text-ink">{month.title}</h2>
              <p className="text-[13px] text-ink-3">{month.subtitle}</p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => go(-1)} aria-label="Previous month" className={navButton}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <Button size="sm" onClick={() => goTo(dayjs().startOf("day"))}>
                Today
              </Button>
              <button type="button" onClick={() => go(1)} aria-label="Next month" className={navButton}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-line bg-surface-2/50">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={`py-2 text-center text-[11px] font-semibold uppercase tracking-wider ${i === 6 ? "text-rose-500 dark:text-rose-300" : "text-ink-3"}`}
              >
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-px bg-line" aria-busy="true">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface p-2 sm:h-24">
                  <Skeleton className="h-4 w-6" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${system}-${cursor.year}-${cursor.month}`}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="grid grid-cols-7 gap-px bg-line"
                role="grid"
                aria-label={month.title}
              >
                {month.cells.map((cell) => {
                  const dayEvents = events.get(cell.key) || [];
                  const isToday = cell.key === todayKey;
                  const isSelected = cell.key === dateKey(selected);
                  const isSaturday = cell.date.day() === 6;
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      role="gridcell"
                      aria-selected={isSelected}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={`${cell.date.format("dddd, MMMM D, YYYY")}, ${formatBs(cell.date)} BS${
                        dayEvents.length ? `, ${dayEvents.length} ${dayEvents.length === 1 ? "event" : "events"}` : ""
                      }`}
                      onClick={() => setSelected(cell.date)}
                      className={`group relative flex h-16 flex-col items-stretch gap-1 p-1.5 text-left outline-none transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-brand/60 sm:h-24 sm:p-2 ${
                        cell.inMonth ? "bg-surface hover:bg-brand/[0.03]" : "bg-surface-2/60 text-ink-3"
                      } ${isSelected ? "z-[1] ring-2 ring-inset ring-brand/60" : ""}`}
                    >
                      <span className="flex items-start justify-between gap-1">
                        <span
                          className={`flex h-7 min-w-[28px] items-center justify-center rounded-full px-1 text-[13px] font-semibold tabular-nums ${
                            isToday
                              ? "bg-brand-gradient text-white shadow-glow"
                              : cell.inMonth
                                ? isSaturday
                                  ? "text-rose-600 dark:text-rose-300"
                                  : "text-ink"
                                : "text-ink-3"
                          }`}
                        >
                          {cell.primary}
                        </span>
                        <span className="hidden pt-1 text-[10px] font-medium tabular-nums text-ink-3 sm:block">{cell.secondary}</span>
                      </span>
                      {/* Desktop: labeled pills; phones: colored dots */}
                      <span className="hidden min-w-0 flex-col gap-0.5 sm:flex">
                        {dayEvents.slice(0, 2).map((e) => (
                          <EventPill key={e.id} event={e} />
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="px-1 text-[10px] font-medium text-ink-3">+{dayEvents.length - 2} more</span>
                        )}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="mt-auto flex justify-center gap-0.5 sm:hidden" aria-hidden="true">
                          {dayEvents.slice(0, 3).map((e) => (
                            <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${palette[eventStyle[e.type].color].dot}`} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-3 sm:px-5">
            {Object.entries(eventStyle).map(([key, s]) => (
              <span key={key} className="inline-flex items-center gap-1.5 text-xs text-ink-3">
                <span className={`h-2 w-2 rounded-full ${palette[s.color].dot}`} aria-hidden="true" />
                {s.label}
              </span>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4 px-5 pt-5">
              <div className="bg-brand-gradient flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white shadow-glow">
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  {system === "bs" ? selectedBs[0].slice(0, 3) : selected.format("MMM")}
                </span>
                <span className="text-2xl font-bold leading-none tabular-nums">
                  {system === "bs" ? selectedBs[1] : selected.format("D")}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{selected.format("dddd")}</p>
                <p className="text-[13px] text-ink-2">{formatBs(selected)} BS</p>
                <p className="text-[13px] text-ink-3">{selected.format("MMMM D, YYYY")} AD</p>
              </div>
            </div>
            <div className="px-2 pb-3 pt-3">
              {selectedEvents.length === 0 ? (
                <p className="mx-3 rounded-xl border border-dashed border-line px-4 py-3 text-[13px] text-ink-3">
                  Nothing scheduled this day.
                </p>
              ) : (
                <ul>
                  {selectedEvents.map((e) => (
                    <EventRow key={e.id} event={e} onOpen={() => openEvent(e)} />
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader icon={CalendarClock} iconTile={palette.sky.tile} title="Upcoming" description="Next holidays and deadlines" />
            <div className="px-2 pb-3 pt-3">
              {error ? (
                <ErrorState compact title="We couldn't load events" onRetry={reload} />
              ) : loading ? (
                <div className="space-y-3 px-3 py-2">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : upcoming.length === 0 ? (
                <EmptyState icon={CalendarDays} title="No upcoming events" compact />
              ) : (
                <ul>
                  {upcoming.map((e) => (
                    <EventRow key={e.id} event={e} showDate onOpen={() => goTo(dayjs(e.date).startOf("day"))} />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
