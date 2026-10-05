import { motion } from "framer-motion";

// iOS-style switch with an optional visible state label.
const Switch = ({ checked, onChange, label, onLabel, offLabel, tone = "success" }) => {
  const track = checked ? (tone === "success" ? "bg-success" : "bg-brand") : "bg-line-strong";
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
          className="h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgb(15_23_42/0.25)]"
          animate={{ x: checked ? 16 : 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.25 }}
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
