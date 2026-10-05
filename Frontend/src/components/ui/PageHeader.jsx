import { motion } from "framer-motion";
import { colors } from "./colors";

// `icon` + `color` give each section a recognizable colored identity tile.
const PageHeader = ({ title, description, actions, meta, eyebrow, icon: Icon, color = "indigo" }) => (
  <motion.header
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", bounce: 0, duration: 0.45 }}
    className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
  >
    <div className="flex min-w-0 items-start gap-4">
      {Icon && (
        <span className={`hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:flex ${colors[color].tile}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[13px] font-medium text-ink-3">{eyebrow}</p>}
        <h1 className="text-[24px] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
        {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </motion.header>
);

export default PageHeader;
