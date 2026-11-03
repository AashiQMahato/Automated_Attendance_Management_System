import { ProgressRing } from "./Progress";
import { ATTENDANCE_THRESHOLD, formatPercent } from "../../lib/format";

// Status-aware attendance ring: emerald at/above the threshold, amber close
// to it, coral below. Shows the percentage and an optional caption.
const gradients = {
  good: ["#20B99A", "#4FD1B5"],
  near: ["#E9A33B", "#F0BD6E"],
  low: ["#E66B7C", "#F09AA6"],
  none: ["#C7CEDE", "#C7CEDE"],
};

const ringStatus = (rate, total = 1) => {
  if (!total) return "none";
  if (rate >= ATTENDANCE_THRESHOLD) return "good";
  if (rate >= ATTENDANCE_THRESHOLD - 10) return "near";
  return "low";
};

const AttendanceRing = ({ rate = 0, total = 1, size = 120, stroke = 10, caption, label, className = "" }) => {
  const status = ringStatus(rate, total);
  return (
    <div className={className}>
      <ProgressRing value={total ? rate : 0} size={size} stroke={stroke} gradient={gradients[status]} label={label || `Attendance ${formatPercent(rate)}`}>
        <span className="font-semibold tabular-nums tracking-[-0.03em] text-ink" style={{ fontSize: Math.round(size * 0.2) }}>
          {total ? formatPercent(rate, 0) : "—"}
        </span>
        {caption && <span className="mt-0.5 text-[11px] text-ink-3">{caption}</span>}
      </ProgressRing>
    </div>
  );
};

export default AttendanceRing;
