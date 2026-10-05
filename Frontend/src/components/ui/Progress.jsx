import React from "react";
import { motion } from "framer-motion";

const barTones = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-brand",
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
      className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}
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

export const ProgressRing = ({ value = 0, size = 120, stroke = 10, tone = "info", label, children }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-2" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={ringTones[tone]}
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
