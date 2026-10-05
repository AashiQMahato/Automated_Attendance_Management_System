import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, chartGradients, useChartTheme } from "../ui/Chart";
import { ATTENDANCE_THRESHOLD } from "../../lib/format";

// data: [{ label, rate (0-100 | null), present, total }]
const AttendanceTrendChart = ({ data, height = 220 }) => {
  const { colors, axis, grid, cursor } = useChartTheme();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barCategoryGap="28%">
          {chartGradients(colors)}
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={8} />
          <YAxis {...axis} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
          <ReferenceLine
            y={ATTENDANCE_THRESHOLD}
            stroke={colors.axis}
            strokeDasharray="3 4"
            strokeOpacity={0.6}
            ifOverflow="extendDomain"
          />
          <Tooltip
            cursor={cursor}
            content={
              <ChartTooltip
                formatter={(value, _name, p) =>
                  value === null || value === undefined
                    ? ["No classes", "Attendance"]
                    : [`${value}% · ${p.payload.present}/${p.payload.total}`, "Attendance"]
                }
              />
            }
          />
          <Bar dataKey="rate" radius={[8, 8, 3, 3]} maxBarSize={30} isAnimationActive>
            {data.map((d) => (
              <Cell key={d.key ?? d.label} fill={d.rate !== null && d.rate < ATTENDANCE_THRESHOLD ? "url(#g-absent)" : "url(#g-primary)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceTrendChart;
