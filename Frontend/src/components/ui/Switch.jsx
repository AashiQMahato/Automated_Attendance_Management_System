import { motion } from "framer-motion";

// iOS-style switch with an optional visible state label.
const Switch = ({ checked, onChange, label, onLabel, offLabel, tone = "success" }) => {
  const track = checked
    ? tone === "success"
      ? "bg-[#20B99A] shadow-[inset_0_1px_2px_0_rgb(0_0_0/0.12)]"
      : "bg-brand"
    : "bg-ink/[0.12] shadow-[inset_0_1px_2px_0_rgb(0_0_0/0.08)] dark:bg-white/[0.14]";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="focus-ring group inline-flex items-center gap-2 rounded-full"
    >
      <span className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ${track}`}>
        <motion.span
          className="h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgb(16_24_39/0.2),0_0_0_0.5px_rgb(16_24_39/0.06)]"
          animate={{ x: checked ? 16 : 0 }}
          whileTap={{ scaleX: 1.15 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
        />
      </span>
      {(onLabel || offLabel) && (
        <span className={`w-14 text-left text-[13px] font-medium ${checked ? "text-success" : "text-ink-3"}`}>
          {checked ? onLabel : offLabel}
        </span>
      )}
    </button>
  );
};

export default Switch;
