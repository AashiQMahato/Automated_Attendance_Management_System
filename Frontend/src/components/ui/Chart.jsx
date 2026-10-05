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
    cursor: { fill: colors.surface2, opacity: 0.6 },
  };
};

// rows: [{ label, value, color }]
export const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[140px] rounded-lg border border-line bg-surface px-3 py-2 shadow-pop">
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
