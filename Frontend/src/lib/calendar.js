import NepaliDate from "nepali-date-converter";
import { dayjs } from "./format";

// Month grids for Bikram Sambat (BS) and Gregorian (AD). Every cell carries
// its AD date (the key events are stored under) plus the matching day in the
// other system, so the same events render in either view.

const BS_MONTHS = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];
export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const dateKey = (d) => dayjs(d).format("YYYY-MM-DD");

const toBs = (d) => new NepaliDate(dayjs(d).toDate());
const bsToAd = (year, month, day) => dayjs(new NepaliDate(year, month, day).toJsDate()).startOf("day");

export const formatBs = (d, withYear = true) => {
  const bs = toBs(d);
  return `${BS_MONTHS[bs.getMonth()]} ${bs.getDate()}${withYear ? `, ${bs.getYear()}` : ""}`;
};

// cursor = { year, month } in the given system (month is 0-based)
export const cursorFor = (system, date = dayjs()) => {
  if (system === "bs") {
    const bs = toBs(date);
    return { year: bs.getYear(), month: bs.getMonth() };
  }
  const d = dayjs(date);
  return { year: d.year(), month: d.month() };
};

export const shiftCursor = ({ year, month }, delta) => {
  const total = year * 12 + month + delta;
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 };
};

const monthBounds = (system, { year, month }) => {
  if (system === "bs") {
    const start = bsToAd(year, month, 1);
    const next = shiftCursor({ year, month }, 1);
    const end = bsToAd(next.year, next.month, 1).subtract(1, "day");
    return { start, end };
  }
  const start = dayjs(new Date(year, month, 1));
  return { start, end: start.endOf("month").startOf("day") };
};

export const buildMonth = (system, cursor) => {
  const { start, end } = monthBounds(system, cursor);
  const gridStart = start.subtract(start.day(), "day");
  const gridEnd = end.add(6 - end.day(), "day");
  const cells = [];
  for (let d = gridStart; !d.isAfter(gridEnd); d = d.add(1, "day")) {
    const bs = toBs(d);
    const inMonth = !d.isBefore(start) && !d.isAfter(end);
    const primary = system === "bs" ? bs.getDate() : d.date();
    // Secondary label: the other system's day; show its month on the 1st.
    const secondary =
      system === "bs"
        ? d.date() === 1
          ? d.format("MMM D")
          : String(d.date())
        : bs.getDate() === 1
          ? `${BS_MONTHS[bs.getMonth()].slice(0, 3)} 1`
          : String(bs.getDate());
    cells.push({ key: dateKey(d), date: d, primary, secondary, inMonth });
  }

  const title = system === "bs" ? `${BS_MONTHS[cursor.month]} ${cursor.year}` : start.format("MMMM YYYY");
  const otherStart = system === "bs" ? start.format("MMM") : BS_MONTHS[toBs(start).getMonth()];
  const otherEnd = system === "bs" ? end.format("MMM YYYY") : `${BS_MONTHS[toBs(end).getMonth()]} ${toBs(end).getYear()}`;
  const subtitle = `${otherStart} – ${otherEnd} ${system === "bs" ? "AD" : "BS"}`;
  return { cells, title, subtitle };
};

// "YYYY-MM-DD" typed in the active system → AD dayjs (or null).
export const parseInSystem = (system, text) => {
  const [y, m, d] = (text || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  if (system === "bs") {
    try {
      return bsToAd(y, m - 1, d);
    } catch {
      return null;
    }
  }
  const parsed = dayjs(new Date(y, m - 1, d));
  return parsed.isValid() ? parsed : null;
};
