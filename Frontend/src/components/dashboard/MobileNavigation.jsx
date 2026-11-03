import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, MoreHorizontal, X } from "lucide-react";
import { isActivePath, settingsItem } from "./navigation";
import { colors } from "../ui/colors";

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
    `focus-ring flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-medium transition-[color,transform] active:scale-95 ${
      active ? "text-accent" : "text-ink-3 active:text-ink-2"
    }`;

  return (
    <>
      {/* Floating glass tab bar */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
      >
        <div className="glass-chrome mx-auto flex h-[64px] max-w-md items-stretch rounded-[26px] px-1.5">
          {primary.map((item) => {
            const active = isActivePath(pathname, item, config.base);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} aria-current={active ? "page" : undefined} className={tabClass(active)}>
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="tab-active"
                      className="absolute inset-0 rounded-full bg-accent/[0.12] shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a))] dark:bg-accent/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="relative h-5 w-5" strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </span>
                <span className="max-w-full truncate">{item.short || item.name}</span>
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
              className="fixed inset-0 z-50 bg-[rgb(10_15_28/0.35)] backdrop-blur-[4px] md:hidden"
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
              className="glass-pop fixed inset-x-2 bottom-2 z-50 rounded-[28px] md:hidden"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 10px)" }}
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
                  className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.06] text-ink-2 dark:bg-white/10"
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
                          active ? "bg-accent/10 font-medium text-accent" : "text-ink-2"
                        }`}
                      >
                        <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${colors[item.color || "indigo"].tile}`}>
                          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                        </span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li className="mt-1 border-t border-line/70 pt-1">
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
