import React from "react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Card } from "./Card";

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
  const tone = direction === "flat" ? "text-ink-3" : good ? "text-success" : "text-danger";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${tone}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
};

const StatCard = ({ label, value, hint, icon: Icon, tone = "default", trend }) => (
  <Card className="flex flex-col p-4 sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <p className="truncate text-[13px] font-medium text-ink-2">{label}</p>
      {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />}
    </div>
    <p className={`mt-3 text-[26px] font-semibold leading-none tracking-[-0.025em] tabular-nums sm:text-[28px] ${valueTones[tone]}`}>
      {value}
    </p>
    <div className="mt-2.5 flex min-h-[20px] flex-wrap items-center gap-x-2 gap-y-1">
      {trend && <Trend {...trend} />}
      {hint && <span className="text-xs text-ink-3">{hint}</span>}
    </div>
  </Card>
);

export default StatCard;
