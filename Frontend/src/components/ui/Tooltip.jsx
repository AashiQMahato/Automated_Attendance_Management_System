import React from "react";

// Lightweight hover/focus tooltip. The trigger must carry its own accessible
// name (aria-label); the bubble is visual only.
const Tooltip = ({ label, side = "top", children, className = "" }) => {
  const pos = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
    right: "left-full top-1/2 ml-3 -translate-y-1/2",
  }[side];
  return (
    <span className={`group/tip relative inline-flex ${className}`}>
      {children}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 shadow-pop transition-[opacity,transform] duration-150 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${pos}`}
      >
        {label}
      </span>
    </span>
  );
};

export default Tooltip;
