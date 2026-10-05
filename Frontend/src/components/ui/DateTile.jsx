import React from "react";
import { dayjs } from "../../lib/format";
import { colors } from "./colors";

// Calendar-style month/day tile, tinted from the shared palette.
const DateTile = ({ date, color = "indigo", size = "md" }) => {
  const c = colors[color] || colors.indigo;
  const dims = size === "lg" ? "h-14 w-14" : "h-11 w-11";
  return (
    <div className={`flex ${dims} shrink-0 flex-col items-center justify-center rounded-xl leading-none ${c.tile}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{dayjs(date).format("MMM")}</span>
      <span className={`mt-0.5 font-bold tabular-nums ${size === "lg" ? "text-xl" : "text-[15px]"}`}>{dayjs(date).format("D")}</span>
    </div>
  );
};

export default DateTile;
