import React, { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import NepaliDate from "nepali-date-converter";

const StudentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new NepaliDate());
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchDate, setSearchDate] = useState("");

  const nepaliMonths = [
    "Baisakh",
    "Jestha",
    "Ashadh",
    "Shrawan",
    "Bhadra",
    "Ashwin",
    "Kartik",
    "Mangshir",
    "Poush",
    "Magh",
    "Falgun",
    "Chaitra",
  ];

  const nepaliDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = {
    2080: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
    2081: [31, 31, 32, 32, 31, 30, 30, 30, 30, 29, 30, 30],
  };

  const events = {
    "2081-07-20": { title: "Team Meeting", type: "work" },
    "2081-07-25": { title: "Birthday Party", type: "celebration" },
    "2081-07-15": { title: "Project Deadline", type: "deadline" },
    "2081-08-15": { title: "Tihar Festival", type: "festival" },
    "2081-09-25": { title: "Christmas", type: "holiday" },
    "2081-09-30": { title: "New Year Eve", type: "holiday" },
    "2081-10-01": { title: "New Year 2025", type: "holiday" },
  };

  const eventDotColor = {
    work: "bg-brand",
    celebration: "bg-warning",
    festival: "bg-accent",
    holiday: "bg-danger",
    deadline: "bg-warning",
  };

  const getDaysInMonth = (bsDate) => {
    const year = bsDate.getYear();
    const month = bsDate.getMonth();
    return daysInMonth[year]?.[month] || daysInMonth[2081][month];
  };

  const generateCalendarDays = () => {
    const year = currentDate.getYear();
    const month = currentDate.getMonth();
    const startDay = new NepaliDate(year, month, 1).getDay();
    const totalDays = getDaysInMonth(currentDate);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new NepaliDate(year, month, i));
    }
    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new NepaliDate();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getYear() === today.getYear();
  };

  const getUpcomingEvents = () => {
    const today = new NepaliDate();
    return Object.entries(events)
      .map(([date, event]) => ({ date, ...event }))
      .filter((event) => {
        const [year, month, day] = event.date.split("-").map(Number);
        const eventDate = new NepaliDate(year, month - 1, day);
        return eventDate.valueOf() >= today.valueOf();
      })
      .sort((a, b) => {
        const [yearA, monthA, dayA] = a.date.split("-").map(Number);
        const [yearB, monthB, dayB] = b.date.split("-").map(Number);
        return new NepaliDate(yearA, monthA - 1, dayA).valueOf() - new NepaliDate(yearB, monthB - 1, dayB).valueOf();
      })
      .slice(0, 3);
  };

  const compareDates = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getYear() === date2.getYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  };

  const handleSearch = () => {
    const [year, month, day] = searchDate.split("-").map(Number);
    if (year && month && day) {
      setCurrentDate(new NepaliDate(year, month - 1, day));
      setSelectedDate(new NepaliDate(year, month - 1, day));
    }
  };

  const selectedEventKey =
    selectedDate &&
    `${selectedDate.getYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const upcoming = getUpcomingEvents();
  const navButton = "focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Nepali academic calendar (Bikram Sambat)."
        actions={
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <label className="relative">
              <span className="sr-only">Jump to date (YYYY-MM-DD)</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <input
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                placeholder="YYYY-MM-DD"
                inputMode="numeric"
                className="focus-ring h-9 w-40 rounded-lg border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 focus-visible:ring-offset-0"
              />
            </label>
            <Button type="submit">Go</Button>
          </form>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {nepaliMonths[currentDate.getMonth()]} <span className="font-normal text-ink-3">{currentDate.getYear()}</span>
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentDate(new NepaliDate(currentDate.getYear(), currentDate.getMonth() - 1, 1))}
                aria-label="Previous month"
                className={navButton}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new NepaliDate();
                  setCurrentDate(today);
                  setSelectedDate(today);
                }}
                className="focus-ring h-8 rounded-lg px-2.5 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setCurrentDate(new NepaliDate(currentDate.getYear(), currentDate.getMonth() + 1, 1))}
                aria-label="Next month"
                className={navButton}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {nepaliDays.map((day) => (
              <div key={day} className="py-1.5 text-center text-[11px] font-medium uppercase tracking-wide text-ink-3">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, index) => {
              const key =
                date && `${date.getYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
              const event = key && events[key];
              const today = isToday(date);
              const selected = compareDates(selectedDate, date);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  aria-current={today ? "date" : undefined}
                  aria-pressed={selected}
                  aria-label={date ? `${nepaliMonths[date.getMonth()]} ${date.getDate()}${event ? `, ${event.title}` : ""}` : undefined}
                  className={`focus-ring relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm tabular-nums transition-colors sm:aspect-[4/3] ${
                    !date ? "invisible" : ""
                  } ${
                    today
                      ? "bg-brand font-semibold text-brand-fg"
                      : selected
                        ? "bg-brand/10 font-medium text-brand ring-1 ring-brand/30"
                        : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                  }`}
                >
                  {date && (
                    <>
                      <span>{date.getDate()}</span>
                      {event && (
                        <span
                          className={`absolute bottom-1.5 h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${today ? "bg-brand-fg" : eventDotColor[event.type] || "bg-ink-3"}`}
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          {selectedDate && (
            <Card className="p-5">
              <p className="text-xs font-medium text-ink-3">Selected date</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">
                {nepaliMonths[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getYear()}
              </p>
              <p className="mt-2 text-[13px] text-ink-2">
                {selectedEventKey && events[selectedEventKey] ? events[selectedEventKey].title : "No events on this day."}
              </p>
            </Card>
          )}

          <Card>
            <CardHeader title="Upcoming events" />
            {upcoming.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No upcoming events" compact />
            ) : (
              <ul className="p-2 pt-3">
                {upcoming.map((event, index) => (
                  <li key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${eventDotColor[event.type] || "bg-ink-3"}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">{event.title}</span>
                    <span className="shrink-0 text-xs tabular-nums text-ink-3">{event.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentCalendar;
