import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import { colors } from "./colors";
import { dayjs } from "../../lib/format";

/*
  DashboardHeader — the one page header used across every workspace page.
  Compact glass strip: colored identity tile, title + supporting line, a date
  chip for context, optional meta chips and actions on the right.

  icon/color: section identity · eyebrow: small line above the title
  meta: chips under the description · actions: right-aligned controls
  showDate: show today's date chip (on by default)
*/
export const DashboardHeader = ({ title, description, actions, meta, eyebrow, icon: Icon, color = "indigo", showDate = true }) => {
  const c = colors[color] || colors.indigo;
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.5 }}
      className="glass-panel glass-sheen relative overflow-hidden rounded-panel px-4 py-4 sm:px-6 sm:py-5"
    >
      {/* Identity light from the section color, pooled behind the tile. */}
      <span
        className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full opacity-70"
        style={{ background: `radial-gradient(closest-side, ${c.hex}2e, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
          {Icon && (
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/50 dark:ring-white/5 sm:h-12 sm:w-12 ${c.tile}`}
            >
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {eyebrow && <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-3">{eyebrow}</p>}
              {showDate && (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ink-3">
                  {eyebrow && <span aria-hidden="true">·</span>}
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  <time dateTime={dayjs().format("YYYY-MM-DD")}>{dayjs().format("ddd, MMM D, YYYY")}</time>
                </span>
              )}
            </div>
            <h1 className="mt-0.5 text-[22px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[26px]">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-[13.5px] leading-5 text-ink-2 sm:text-sm">{description}</p>}
            {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div>}
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
