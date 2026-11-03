import { motion } from "framer-motion";

/*
  The standard content surface: a Liquid Glass panel (translucent fill, bright
  rim, hairline edge, soft depth). Every card fades up the first time it
  scrolls into view; reduced-motion users get the fade only.

  variant: "glass" (default) | "solid" (opaque, for dense data) | "tinted"
  (picks up the role accent; for featured content)
*/
const variants = {
  glass: "glass-panel glass-sheen",
  solid: "border border-line/80 bg-surface shadow-card",
  tinted: "glass-panel glass-sheen bg-gradient-to-br from-accent/[0.07] via-transparent to-accent-2/[0.05]",
};

export const Card = ({
  as: Tag = "section",
  className = "",
  interactive = false,
  reveal = true,
  delay = 0,
  variant = "glass",
  children,
  ...props
}) => {
  const MotionTag = motion[Tag] || motion.section;
  const motionProps = reveal
    ? {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { type: "spring", bounce: 0, duration: 0.55, delay },
      }
    : {};
  return (
    <MotionTag
      className={`rounded-panel ${variants[variant] || variants.glass} ${
        interactive ? "transition-[box-shadow,transform] duration-300 ease-apple hover:-translate-y-0.5 hover:shadow-lift" : ""
      } ${className}`}
      {...motionProps}
      {...props}
    >
      {children}
    </MotionTag>
  );
};

// Section header with a hairline divider below it (Apple-style grouped header).
// `iconTile` paints the optional icon as a tinted tile from the shared palette.
export const CardHeader = ({ title, description, action, icon: Icon, iconTile, className = "", id }) => (
  <div className={`flex items-center justify-between gap-4 border-b border-line/70 px-5 py-4 sm:px-6 ${className}`}>
    <div className="flex min-w-0 items-start gap-3">
      {Icon &&
        (iconTile ? (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/40 dark:ring-white/5 ${iconTile}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : (
          <Icon className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        ))}
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold leading-6 tracking-[-0.015em] text-ink sm:text-base">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export const CardBody = ({ className = "", children }) => <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
