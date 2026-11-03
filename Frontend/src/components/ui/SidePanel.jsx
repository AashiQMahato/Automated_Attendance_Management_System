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
  accent = "from-brand/[0.08] via-brand-2/[0.04] to-transparent",
  footer,
  label,
  children,
}) => {
  const small = useIsSmall();

  // antd only handles Escape while focus is inside the drawer; content that
  // unmounts (e.g. a submitted form) drops focus to <body>. Close from
  // anywhere, unless a dialog is stacked on top.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (document.querySelector(".ant-modal-wrap:not([style*='display: none']) .ant-modal")) return;
      onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
              borderRadius: 26,
              overflow: "hidden",
              boxShadow: "none",
            },
        content: { background: "transparent" },
        body: { padding: 0, display: "flex", flexDirection: "column" },
        mask: { backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", background: "rgb(10 15 28 / 0.32)" },
      }}
    >
      <div className={`glass-pop flex min-h-full flex-col ${small ? "" : "rounded-[26px]"}`}>
        <div
          className={`relative border-b border-line/70 bg-gradient-to-b px-5 pb-5 pt-4 sm:px-6 ${accent}`}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/[0.06] text-ink-2 backdrop-blur transition-colors hover:bg-ink/[0.1] hover:text-ink dark:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="pr-12">{header}</div>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <div className="sticky bottom-0 border-t border-line/70 bg-[rgb(var(--glass)/0.7)] px-5 py-4 backdrop-blur-xl sm:px-6">{footer}</div>
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
