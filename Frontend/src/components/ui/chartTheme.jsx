import { useTheme } from "../../theme/useTheme";

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
