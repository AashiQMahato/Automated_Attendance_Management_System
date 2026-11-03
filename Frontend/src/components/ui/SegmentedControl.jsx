import { useId } from "react";
import { motion } from "framer-motion";

// options: [{ value, label, icon? }]
const SegmentedControl = ({ options, value, onChange, label, size = "sm" }) => {
  const id = useId();
  const height = size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]";
  return (
    <div role="radiogroup" aria-label={label} className="glass-well inline-flex rounded-[12px] p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`focus-ring relative inline-flex items-center gap-1.5 rounded-[9px] px-2.5 font-medium transition-colors ${height} ${
              active ? "text-brand" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[9px] bg-surface shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_1px_3px_0_rgb(16_24_39/0.1)] ring-1 ring-black/[0.04] dark:bg-white/[0.12] dark:ring-white/10"
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              />
            )}
            {Icon && <Icon className="relative h-3.5 w-3.5" aria-hidden="true" />}
            <span className="relative">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
