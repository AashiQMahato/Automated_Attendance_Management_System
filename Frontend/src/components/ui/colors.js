// One categorical palette for stat cards, subjects, avatars and chart series.
// Class strings are written out in full so Tailwind can see them.
export const colors = {
  indigo: {
    tile: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    soft: "bg-indigo-50/70 dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-300",
    dot: "bg-indigo-500",
    glow: "bg-indigo-400/25",
    hex: "#6366F1",
    hex2: "#818CF8",
  },
  violet: {
    tile: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    soft: "bg-violet-50/70 dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-300",
    dot: "bg-violet-500",
    glow: "bg-violet-400/25",
    hex: "#8B5CF6",
    hex2: "#A78BFA",
  },
  sky: {
    tile: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    soft: "bg-sky-50/70 dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    glow: "bg-sky-400/25",
    hex: "#0EA5E9",
    hex2: "#38BDF8",
  },
  emerald: {
    tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    soft: "bg-emerald-50/70 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    glow: "bg-emerald-400/25",
    hex: "#10B981",
    hex2: "#34D399",
  },
  amber: {
    tile: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    soft: "bg-amber-50/70 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    glow: "bg-amber-400/25",
    hex: "#F59E0B",
    hex2: "#FBBF24",
  },
  rose: {
    tile: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    soft: "bg-rose-50/70 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-300",
    dot: "bg-rose-500",
    glow: "bg-rose-400/25",
    hex: "#F43F5E",
    hex2: "#FB7185",
  },
  cyan: {
    tile: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    soft: "bg-cyan-50/70 dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    glow: "bg-cyan-400/25",
    hex: "#06B6D4",
    hex2: "#22D3EE",
  },
  fuchsia: {
    tile: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    soft: "bg-fuchsia-50/70 dark:bg-fuchsia-500/10",
    text: "text-fuchsia-600 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
    glow: "bg-fuchsia-400/25",
    hex: "#D946EF",
    hex2: "#E879F9",
  },
};

const order = ["indigo", "emerald", "amber", "sky", "violet", "rose", "cyan", "fuchsia"];

const hash = (str = "") => [...String(str)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Stable color for anything with an id or name (subjects, people).
export const colorFor = (key) => order[hash(key) % order.length];

// Distinct colors for an ordered list (e.g. subjects in a chart).
export const colorAt = (index) => order[index % order.length];
