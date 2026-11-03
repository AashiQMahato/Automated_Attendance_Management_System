// One categorical palette for stat cards, subjects, avatars and chart series.
// Class strings are written out in full so Tailwind can see them.
export const colors = {
  indigo: {
    tile: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
    soft: "bg-indigo-500/[0.06] dark:bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-300",
    dot: "bg-indigo-500",
    glow: "bg-indigo-400/25",
    hex: "#5267E8",
    hex2: "#7C8DF0",
  },
  violet: {
    tile: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    soft: "bg-violet-500/[0.06] dark:bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-300",
    dot: "bg-violet-500",
    glow: "bg-violet-400/25",
    hex: "#8763E8",
    hex2: "#A68BF0",
  },
  sky: {
    tile: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    soft: "bg-sky-500/[0.06] dark:bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-300",
    dot: "bg-sky-500",
    glow: "bg-sky-400/25",
    hex: "#259EDB",
    hex2: "#5DB8E6",
  },
  emerald: {
    tile: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    soft: "bg-emerald-500/[0.06] dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
    glow: "bg-emerald-400/25",
    hex: "#20B99A",
    hex2: "#4FD1B5",
  },
  amber: {
    tile: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    soft: "bg-amber-500/[0.06] dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
    glow: "bg-amber-400/25",
    hex: "#E9A33B",
    hex2: "#F0BD6E",
  },
  rose: {
    tile: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
    soft: "bg-rose-500/[0.06] dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-300",
    dot: "bg-rose-500",
    glow: "bg-rose-400/25",
    hex: "#E66B7C",
    hex2: "#F09AA6",
  },
  teal: {
    tile: "bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    soft: "bg-teal-500/[0.06] dark:bg-teal-500/10",
    text: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500",
    glow: "bg-teal-400/25",
    hex: "#14B8A6",
    hex2: "#2DD4BF",
  },
  cyan: {
    tile: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300",
    soft: "bg-cyan-500/[0.06] dark:bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-300",
    dot: "bg-cyan-500",
    glow: "bg-cyan-400/25",
    hex: "#06B6D4",
    hex2: "#22D3EE",
  },
  fuchsia: {
    tile: "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    soft: "bg-fuchsia-500/[0.06] dark:bg-fuchsia-500/10",
    text: "text-fuchsia-600 dark:text-fuchsia-300",
    dot: "bg-fuchsia-500",
    glow: "bg-fuchsia-400/25",
    hex: "#D946EF",
    hex2: "#E879F9",
  },
};

const order = ["indigo", "emerald", "amber", "sky", "violet", "rose", "teal", "cyan", "fuchsia"];

const hash = (str = "") => [...String(str)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

// Stable color for anything with an id or name (subjects, people).
export const colorFor = (key) => order[hash(key) % order.length];
