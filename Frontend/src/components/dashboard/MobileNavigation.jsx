import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import { isActivePath, settingsItem } from "./navigation";

// Bottom tab bar for phones. Secondary destinations open in a bottom sheet
// that rises from (and returns to) the tab bar.
const MobileNavigation = ({ config, onLogout }) => {
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const primary = config.items.filter((i) => i.mobile);
  const secondary = [...config.items.filter((i) => !i.mobile), { ...settingsItem, path: config.settingsPath }];
  const moreActive = secondary.some((i) => isActivePath(pathname, i, config.base));

  useEffect(() => setSheetOpen(false), [pathname]);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const tabClass = (active) =>
    `focus-ring flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
      active ? "text-brand" : "text-ink-3 active:text-ink-2"
    }`;

  return (
    <>
      <nav
        aria-label="Primary"
        className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/85 backdrop-blur-xl backdrop-saturate-150 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
          {primary.map((item) => {
            const active = isActivePath(pathname, item, config.base);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="tab-active"
                      className="absolute inset-0 rounded-full bg-brand/10 dark:bg-brand/20"
                      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="relative h-5 w-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </span>
                {item.short || item.name}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            aria-haspopup="dialog"
            className={tabClass(moreActive)}
          >
            <span className="flex h-7 w-12 items-center justify-center">
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </span>
            More
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-50 bg-slate-950/40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              aria-label="More"
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-line bg-surface shadow-pop md:hidden"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80 || info.velocity.y > 500) setSheetOpen(false);
              }}
            >
              <div className="mx-auto mt-2 h-1 w-9 rounded-full bg-line-strong" aria-hidden="true" />
              <div className="flex items-center justify-between px-5 pb-2 pt-3">
                <p className="text-[15px] font-semibold text-ink">More</p>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close"
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="px-3">
                {secondary.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item, config.base);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        aria-current={active ? "page" : undefined}
                        className={`focus-ring flex h-12 items-center gap-3 rounded-xl px-3 text-[15px] ${
                          active ? "bg-brand/10 font-medium text-brand" : "text-ink-2"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${active ? "text-brand" : "text-ink-3"}`} aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-1 border-t border-line pt-1">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="focus-ring flex h-12 w-full items-center gap-3 rounded-xl px-3 text-[15px] text-danger"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    Log out
                  </button>
                </li>
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;
