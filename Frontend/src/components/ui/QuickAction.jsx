import React from "react";
import { ChevronRight } from "lucide-react";

// A compact, full-width action row. `primary` gives the most important action
// visual dominance without a different shape.
const QuickAction = ({ icon: Icon, title, description, onClick, primary = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`focus-ring group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 active:scale-[0.99] ${
      primary ? "bg-brand text-brand-fg hover:bg-brand/90" : "hover:bg-surface-2"
    }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        primary ? "bg-white/15" : "border border-line bg-surface text-ink-2"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block text-sm font-medium ${primary ? "" : "text-ink"}`}>{title}</span>
      {description && <span className={`block truncate text-xs ${primary ? "text-brand-fg/80" : "text-ink-3"}`}>{description}</span>}
    </span>
    <ChevronRight
      className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
        primary ? "text-brand-fg/70" : "text-ink-3"
      }`}
      aria-hidden="true"
    />
  </button>
);

export default QuickAction;
