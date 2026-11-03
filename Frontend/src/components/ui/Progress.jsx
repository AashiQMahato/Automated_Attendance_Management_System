import { motion } from "framer-motion";

const barTones = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-brand-gradient",
  present: "bg-[linear-gradient(90deg,#20B99A,#4FD1B5)]",
  low: "bg-[linear-gradient(90deg,#E9A33B,#F0BD6E)]",
  critical: "bg-[linear-gradient(90deg,#E66B7C,#F09AA6)]",
  accent: "bg-accent",
  neutral: "bg-ink-3",
};

const ringTones = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  info: "text-brand",
  accent: "text-accent",
  neutral: "text-ink-3",
  white: "text-white",
};

export const ProgressBar = ({ value = 0, tone = "info", label, className = "" }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.07] dark:bg-white/[0.08] ${className}`}
    >
      <motion.div
        className={`h-full rounded-full ${barTones[tone]}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ type: "spring", bounce: 0, duration: 0.6 }}
      />
    </div>
  );
};

export const ProgressRing = ({
  value = 0,
  size = 120,
  stroke = 10,
  tone = "info",
  label,
  trackClass = "stroke-ink/[0.07] dark:stroke-white/[0.08]",
  gradient,
  children,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const gid = gradient ? `ring-${gradient[0].slice(1)}-${gradient[1].slice(1)}` : null;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
        {gradient && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          </defs>
        )}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={gradient ? `url(#${gid})` : "currentColor"}
          className={gradient ? undefined : ringTones[tone]}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (clamped / 100) * c }}
          transition={{ type: "spring", bounce: 0, duration: 0.9 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};
