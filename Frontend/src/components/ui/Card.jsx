import { motion } from "framer-motion";

// Every card fades up the first time it scrolls into view. Reduced-motion
// users get the fade only (MotionConfig reducedMotion="user").
export const Card = ({ as: Tag = "section", className = "", interactive = false, reveal = true, delay = 0, children, ...props }) => {
  const MotionTag = motion[Tag] || motion.section;
  const motionProps = reveal
    ? {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.12 },
        transition: { type: "spring", bounce: 0, duration: 0.5, delay },
      }
    : {};
  return (
    <MotionTag
      className={`rounded-2xl border border-line/80 bg-surface shadow-card dark:border-line dark:shadow-none ${
        interactive ? "transition-[box-shadow,transform,border-color] duration-200 ease-apple hover:-translate-y-0.5 hover:shadow-lift" : ""
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
  <div className={`flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 ${className}`}>
    <div className="flex min-w-0 items-start gap-3">
      {Icon &&
        (iconTile ? (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconTile}`}>
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        ) : (
          <Icon className="mt-1 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
        ))}
      <div className="min-w-0">
        <h2 id={id} className="text-base font-semibold leading-6 tracking-[-0.015em] text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export const CardBody = ({ className = "", children }) => <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
