import { useEffect, useState } from "react";
import { Drawer } from "antd";
import { X } from "lucide-react";

const useIsSmall = () => {
  const query = "(max-width: 639px)";
  const [small, setSmall] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setSmall(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return small;
};

/*
  Premium side sheet built on antd Drawer (keeps its focus trap, Esc and
  scroll locking). On desktop it floats inset from the edge with rounded
  corners; on phones it becomes a full-height sheet.

  header: node rendered in the tinted top area (title, meta…)
  accent: Tailwind gradient classes for that top area
  footer: node pinned to the bottom (primary actions)
*/
const SidePanel = ({
  open,
  onClose,
  width = 480,
  header,
  accent = "from-indigo-50 via-violet-50/60 to-transparent",
  footer,
  label,
  children,
}) => {
  const small = useIsSmall();
  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={small ? "100%" : width}
      closable={false}
      title={null}
      aria-label={label}
      styles={{
        wrapper: small
          ? { boxShadow: "none" }
          : {
              margin: 12,
              height: "calc(100% - 24px)",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 24px 60px -12px rgb(17 19 43 / 0.35)",
            },
        body: { padding: 0, display: "flex", flexDirection: "column" },
        mask: { backdropFilter: "blur(2px)", background: "rgb(9 11 22 / 0.35)" },
      }}
    >
      <div className="flex min-h-full flex-col bg-surface">
        <div
          className={`relative border-b border-line bg-gradient-to-b px-5 pb-5 pt-4 dark:from-indigo-500/10 dark:via-transparent sm:px-6 ${accent}`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-ink-2 shadow-xs ring-1 ring-line backdrop-blur transition-colors hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="pr-12">{header}</div>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="glass sticky bottom-0 border-t border-line bg-surface/90 px-5 py-4 backdrop-blur-xl sm:px-6">{footer}</div>
        )}
      </div>
    </Drawer>
  );
};

// Small labeled section used inside panels.
export const PanelSection = ({ title, action, children }) => (
  <section>
    <div className="mb-2.5 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

export default SidePanel;
