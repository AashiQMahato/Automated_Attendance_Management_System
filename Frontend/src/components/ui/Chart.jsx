import React from "react";
import { useTheme } from "../../theme/ThemeProvider";

// Shared Recharts styling so every chart speaks the dashboard's language.
export const useChartTheme = () => {
  const { colors } = useTheme();
  const c = colors.chart;
  return {
    colors: c,
    axis: {
      stroke: c.axis,
      tick: { fill: c.axis, fontSize: 12 },
      tickLine: false,
      axisLine: false,
    },
    grid: { stroke: c.grid, vertical: false },
    cursor: { fill: c.primary, opacity: 0.06, radius: 8 },
  };
};

// Shared gradient fills. Recharts only renders <defs> passed as a direct
// child, so call this as a function inside the chart: {chartGradients(colors)}.
// Fill with url(#g-primary), url(#g-present), url(#g-absent), or
// url(#g-<hex>) for categorical series registered via `extra`.
export const chartGradients = (c, extra = []) => (
  <defs>
    <linearGradient id="g-primary" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c.primary2} />
      <stop offset="100%" stopColor={c.primary} />
    </linearGradient>
    <linearGradient id="g-present" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c.present2} />
      <stop offset="100%" stopColor={c.present} />
    </linearGradient>
    <linearGradient id="g-absent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c.absent2} />
      <stop offset="100%" stopColor={c.absent} />
    </linearGradient>
    <linearGradient id="g-area" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={c.primary} stopOpacity={0.3} />
      <stop offset="100%" stopColor={c.primary2} stopOpacity={0} />
    </linearGradient>
    {extra.map(([from, to]) => (
      <linearGradient key={from} id={`g-${from.slice(1)}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </linearGradient>
    ))}
  </defs>
);

// rows: [{ label, value, color }]
export const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[150px] rounded-xl border border-line bg-surface/95 px-3 py-2.5 shadow-pop backdrop-blur">
      <p className="mb-1 text-xs font-medium text-ink-3">{labelFormatter ? labelFormatter(label, payload) : label}</p>
      {payload.map((p) => {
        const [value, name] = formatter ? formatter(p.value, p.name, p) : [p.value, p.name];
        return (
          <div key={p.dataKey ?? p.name} className="flex items-center justify-between gap-4 text-[13px]">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} aria-hidden="true" />
              {name}
            </span>
            <span className="font-medium tabular-nums text-ink">{value}</span>
          </div>
        );
      })}
    </div>
  );
};

export const LegendDot = ({ color, children }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-ink-3">
    <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden="true" />
    {children}
  </span>
);
