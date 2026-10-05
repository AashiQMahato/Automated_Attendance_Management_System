import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(relativeTime);
dayjs.extend(isoWeek);

export { dayjs };

// Minimum attendance most institutions require; also the threshold the
// previous dashboards used for success vs. exception states.
export const ATTENDANCE_THRESHOLD = 75;

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export const firstName = (fullName) => (fullName || "").trim().split(/\s+/)[0] || "there";

export const initials = (fullName, fallback = "U") =>
  (fullName || fallback)
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const percent = (part, total) => (total > 0 ? (part / total) * 100 : 0);

export const formatPercent = (value, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const rounded = Number(value.toFixed(digits));
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(digits)}%`;
};

// Maps an attendance rate to a label + tone used by badges and copy.
export const attendanceStatus = (rate, hasData = true) => {
  if (!hasData) return { label: "No classes yet", tone: "neutral" };
  if (rate >= 90) return { label: "Excellent", tone: "success" };
  if (rate >= ATTENDANCE_THRESHOLD) return { label: "Good standing", tone: "success" };
  if (rate >= 60) return { label: "Needs attention", tone: "warning" };
  return { label: "At risk", tone: "danger" };
};

export const relativeDay = (date) => {
  const d = dayjs(date);
  const today = dayjs().startOf("day");
  const diff = d.startOf("day").diff(today, "day");
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return d.format("MMM D");
};

export const downloadCsv = (filename, rows) => {
  const escape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Due-date status shared by teacher and student assignment views.
export const dueStatus = (dueDate) => {
  const days = dayjs(dueDate).startOf("day").diff(dayjs().startOf("day"), "day");
  if (days < 0) return { key: "overdue", tone: "danger", label: "Overdue" };
  if (days === 0) return { key: "today", tone: "warning", label: "Due today" };
  if (days <= 2) return { key: "soon", tone: "warning", label: `Due ${relativeDay(dueDate).toLowerCase()}` };
  return { key: "upcoming", tone: "neutral", label: `Due ${dayjs(dueDate).fromNow()}` };
};
