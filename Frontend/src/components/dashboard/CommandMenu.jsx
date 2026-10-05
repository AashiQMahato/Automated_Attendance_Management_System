import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Moon, Search, Sun } from "lucide-react";
import { colors } from "../ui/colors";
import { useTheme } from "../../theme/ThemeProvider";
import { allItems } from "./navigation";

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

// Spotlight-style quick jump: every dashboard destination plus a theme switch.
// Opens with ⌘K / Ctrl+K or from the header search pill.
const CommandMenu = ({ open, onClose, config }) => {
  const navigate = useNavigate();
  const { resolved, setPreference } = useTheme();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const actions = useMemo(() => {
    const pages = allItems(config).map((item) => ({
      id: item.path,
      label: item.name,
      group: "Go to",
      icon: item.icon,
      color: item.color,
      run: () => navigate(item.path),
    }));
    const next = resolved === "dark" ? "light" : "dark";
    return [
      ...pages,
      {
        id: "theme",
        label: `Switch to ${next} mode`,
        group: "Appearance",
        icon: next === "dark" ? Moon : Sun,
        color: "violet",
        run: () => setPreference(next),
      },
    ];
  }, [config, navigate, resolved, setPreference]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setIndex(0);
      // Focus after the panel mounts.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const run = (action) => {
    onClose();
    action.run();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && results[index]) {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup = null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="dashboard-root fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          style={{ background: "transparent" }}
        >
          <motion.div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search and jump"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -4 }}
            transition={{ type: "spring", bounce: 0, duration: 0.28 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/60 bg-surface/90 shadow-pop ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-[18px] w-[18px] shrink-0 text-ink-3" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages and actions…"
                aria-label="Search pages and actions"
                aria-controls="command-results"
                aria-activedescendant={results[index] ? `cmd-${index}` : undefined}
                role="combobox"
                aria-expanded="true"
                className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="hidden shrink-0 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-3 sm:block">
                esc
              </kbd>
            </div>
            <ul ref={listRef} id="command-results" role="listbox" className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-3">No results for “{query}”</li>}
              {results.map((action, i) => {
                const Icon = action.icon;
                const showGroup = action.group !== lastGroup;
                lastGroup = action.group;
                const active = i === index;
                return (
                  <React.Fragment key={action.id}>
                    {showGroup && (
                      <li role="presentation" className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        {action.group}
                      </li>
                    )}
                    <li
                      id={`cmd-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={active}
                      onMouseMove={() => setIndex(i)}
                      onClick={() => run(action)}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        active ? "bg-brand/10 text-ink" : "text-ink-2"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[action.color || "indigo"].tile}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 font-medium">{action.label}</span>
                      {active && <CornerDownLeft className="h-4 w-4 text-ink-3" aria-hidden="true" />}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default CommandMenu;
