import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Click-to-open popover anchored to its trigger (scales from the trigger's
// corner). Closes on outside click, Escape, or when `close()` is called.
const Popover = ({ trigger, children, align = "right", width = "w-72", label }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const id = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    // Move focus into the panel for keyboard users.
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector("button, a, [tabindex='0']")?.focus({ preventScroll: true });
    }, 0);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      {trigger({
        ref: triggerRef,
        open,
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        "aria-controls": id,
        onClick: () => setOpen((o) => !o),
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-label={label}
            initial={{ opacity: 0, scale: 0.96, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, y: -2 }}
            transition={{ type: "spring", bounce: 0.12, duration: 0.32 }}
            style={{ transformOrigin: align === "right" ? "top right" : "top left" }}
            className={`absolute top-full z-50 mt-2 ${align === "right" ? "right-0" : "left-0"} ${width} max-w-[calc(100vw-2rem)] glass-pop overflow-hidden rounded-[20px]`}
          >
            {typeof children === "function" ? children({ close }) : children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popover;
