import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "./Card";
import Sparkline from "./Sparkline";
import { colors } from "./colors";

const valueTones = {
  default: "text-ink",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

// trend: { direction: "up" | "down" | "flat", label: string, positive?: boolean }
const Trend = ({ direction, label, positive }) => {
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const good = positive ?? direction === "up";
  const tone =
    direction === "flat"
      ? "bg-surface-2 text-ink-3"
      : good
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
        : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  );
};

/*
  color: key of the shared palette (indigo, emerald, amber, rose, sky, violet…)
  spark: optional array of numbers rendered as a small trend line
  index: position in a grid, used to stagger the entrance
*/
const StatCard = ({ label, value, hint, icon: Icon, tone = "default", trend, color = "indigo", spark, index = 0 }) => {
  const c = colors[color] || colors.indigo;
  return (
    <Card interactive delay={index * 0.05} className="group relative flex flex-col overflow-hidden p-4 sm:p-5">
      {/* Soft colored glow, the card's identity */}
      <span
        className={`pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${c.glow} opacity-70`}
        aria-hidden="true"
      />
      <div className="relative flex items-center justify-between gap-2">
        <p className="min-w-0 text-[12px] font-medium leading-tight text-ink-2 sm:truncate sm:text-[13px]">{label}</p>
        {Icon && (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-9 sm:w-9 ${c.tile}`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <p className={`text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums sm:text-[30px] ${valueTones[tone]}`}>
          {value}
        </p>
        {spark && <Sparkline values={spark} color={c.hex} className="hidden shrink-0 sm:block" />}
      </div>
      <div className="relative mt-3 flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1">
        {trend && <Trend {...trend} />}
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
      </div>
    </Card>
  );
};

export default StatCard;
