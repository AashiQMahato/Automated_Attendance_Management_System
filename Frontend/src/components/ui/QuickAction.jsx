import { ChevronRight } from "lucide-react";
import { colors } from "./colors";

// A compact, full-width action row. `primary` gives the most important action
// visual dominance without a different shape.
const QuickAction = ({ icon: Icon, title, description, onClick, primary = false, color = "indigo" }) => (
  <button
    type="button"
    onClick={onClick}
    className={`focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 active:scale-[0.99] ${
      primary ? "bg-brand-gradient text-white shadow-glow hover:brightness-110" : "hover:bg-surface-2"
    }`}
  >
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${primary ? "bg-white/20" : colors[color].tile}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block text-sm font-medium ${primary ? "" : "text-ink"}`}>{title}</span>
      {description && <span className={`block truncate text-xs ${primary ? "text-white/80" : "text-ink-3"}`}>{description}</span>}
    </span>
    <ChevronRight
      className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
        primary ? "text-white/70" : "text-ink-3"
      }`}
      aria-hidden="true"
    />
  </button>
);

export default QuickAction;
