import React, { useId } from "react";
import { motion } from "framer-motion";

// options: [{ value, label, icon? }]
const SegmentedControl = ({ options, value, onChange, label, size = "sm" }) => {
  const id = useId();
  const height = size === "sm" ? "h-7 text-xs" : "h-8 text-[13px]";
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-surface-2 p-0.5">
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
            className={`focus-ring relative inline-flex items-center gap-1.5 rounded-md px-2.5 font-medium transition-colors ${height} ${
              active ? "text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-md bg-surface shadow-xs ring-1 ring-line"
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
