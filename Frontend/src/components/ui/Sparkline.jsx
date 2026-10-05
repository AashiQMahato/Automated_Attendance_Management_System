import { useId } from "react";

// Tiny dependency-free trend line. `values` may contain nulls (gaps are skipped).
const Sparkline = ({ values, color = "#6366F1", width = 96, height = 32, className = "" }) => {
  const id = useId();
  const pts = values.map((v, i) => [i, v]).filter(([, v]) => v !== null && v !== undefined);
  if (pts.length < 2) return null;
  const ys = pts.map(([, v]) => v);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const span = max - min || 1;
  const x = (i) => (i / (values.length - 1)) * (width - 4) + 2;
  const y = (v) => height - 3 - ((v - min) / span) * (height - 8);
  const line = pts.map(([i, v], k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts[pts.length - 1][0]).toFixed(1)},${height} L${x(pts[0][0]).toFixed(1)},${height} Z`;
  const [lx, lv] = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(lx)} cy={y(lv)} r="2.5" fill={color} />
    </svg>
  );
};

export default Sparkline;
