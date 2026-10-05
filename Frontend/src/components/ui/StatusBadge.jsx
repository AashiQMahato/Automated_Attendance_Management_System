import React from "react";
import { colors } from "./colors";

const tones = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-brand/10 text-brand",
  accent: "bg-accent/10 text-accent",
  neutral: "bg-surface-2 text-ink-2",
};

const dots = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-brand",
  accent: "bg-accent",
  neutral: "bg-ink-3",
};

// `color` (palette key) overrides `tone` for categorical labels like subjects.
const StatusBadge = ({ tone = "neutral", color, dot = true, icon: Icon, className = "", children }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium leading-5 ${color ? colors[color].tile : tones[tone]} ${className}`}
  >
    {Icon ? (
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    ) : (
      dot && <span className={`h-1.5 w-1.5 rounded-full ${color ? colors[color].dot : dots[tone]}`} aria-hidden="true" />
    )}
    {children}
  </span>
);

export default StatusBadge;
