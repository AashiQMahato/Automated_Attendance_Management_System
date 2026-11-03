import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";

/*
  Apple-style pop-up menu (macOS NSPopUpButton feel).
  options: [{ value, label, description? }]
  onChange(value) receives the value, so it also works inside antd Form.Item.

  - The menu is a translucent material that grows out of the trigger
    (transform-origin on the trigger edge) with a critically damped spring.
  - The highlight follows the pointer and the keyboard; the chosen item has a check.
  - Rendered in a portal with fixed positioning, so drawers and scrolling
    tables don't clip it; flips above the trigger when there's no room below.
*/

const SIZES = {
  md: "h-11 rounded-xl px-3.5 text-sm",
  control: "h-10 rounded-[10px] px-3 text-sm", // matches Button and antd controls
  sm: "h-9 rounded-xl px-3 text-[13px]",
};
const MENU_MAX = 288; // px, roughly 7 rows before scrolling
const GAP = 6;

const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Select…",
  size = "md",
  searchable = false,
  loading = false,
  disabled = false,
  required = false,
  emptyText = "No options",
  className = "",
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}) => {
  const autoId = useId();
  const triggerId = id || `select-${autoId}`;
  const listId = `${triggerId}-list`;
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [place, setPlace] = useState(null);

  const selected = options.find((o) => o.value === value);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => String(o.label).toLowerCase().includes(q)) : options;
  }, [options, query]);

  // Position against the trigger; flip above when the space below is short.
  const measure = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const up = below < Math.min(MENU_MAX, 200) && above > below;
    setPlace({
      left: Math.min(r.left, window.innerWidth - Math.max(r.width, 200) - 8),
      width: Math.max(r.width, 200),
      top: up ? undefined : r.bottom + GAP,
      bottom: up ? window.innerHeight - r.top + GAP : undefined,
      maxHeight: Math.min(MENU_MAX, up ? above : below),
      up,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open]);

  // Close on any press outside the trigger and menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!triggerRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted row visible while moving with the keyboard.
  useEffect(() => {
    if (open && active >= 0) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const openMenu = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  const choose = (option) => {
    if (!option) return;
    onChange?.(option.value);
    close();
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    const last = shown.length - 1;
    const keys = {
      ArrowDown: () => setActive((i) => Math.min(last, i + 1)),
      ArrowUp: () => setActive((i) => Math.max(0, i - 1)),
      Home: () => setActive(0),
      End: () => setActive(last),
      Enter: () => choose(shown[active]),
      Escape: () => close(),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    } else if (e.key === "Tab") {
      setOpen(false);
    } else if (!searchable && e.key.length === 1) {
      // Typeahead: jump to the first item starting with what was typed.
      const t = typeahead.current;
      clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = setTimeout(() => (t.text = ""), 600);
      const hit = shown.findIndex((o) => String(o.label).toLowerCase().startsWith(t.text));
      if (hit >= 0) setActive(hit);
    }
  };

  const activeId = open && active >= 0 && shown[active] ? `${listId}-${active}` : undefined;

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={searchable ? undefined : activeId}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={onKeyDown}
        className={`focus-ring group flex w-full items-center gap-2 border bg-surface/70 text-left text-ink shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_1px_2px_0_rgb(16_24_39/0.04)] dark:bg-canvas/40 transition-[border-color,box-shadow,transform] duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
          open ? "border-brand/60 shadow-[0_0_0_3px_rgb(var(--brand)/0.12)]" : "border-line hover:border-line-strong"
        } ${SIZES[size]}`}
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-ink-3"}`}>{selected ? selected.label : placeholder}</span>
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-3" aria-hidden="true" />
        ) : (
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-3 transition-colors group-hover:text-ink-2" aria-hidden="true" />
        )}
      </button>

      {/* Lets native form validation block submit when nothing is chosen. */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value ?? ""}
          onChange={() => {}}
          onFocus={() => triggerRef.current?.focus()}
          className="pointer-events-none absolute bottom-0 left-1/2 h-px w-px opacity-0"
        />
      )}

      {createPortal(
        <AnimatePresence>
          {open && place && (
            <motion.div
              ref={listRef}
              key="menu"
              initial={{ opacity: 0, scale: 0.96, y: place.up ? 4 : -4 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0, duration: 0.28 } }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
              style={{
                position: "fixed",
                left: place.left,
                width: place.width,
                top: place.top,
                bottom: place.bottom,
                transformOrigin: place.up ? "bottom center" : "top center",
              }}
              className="select-menu glass-pop z-[1100] flex flex-col overflow-hidden rounded-2xl"
            >
              {searchable && (
                <div className="flex items-center gap-2 border-b border-line/70 px-3 py-2">
                  <Search className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={activeId}
                    aria-label="Search options"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                    placeholder="Search"
                    className="h-7 min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-3 focus:outline-none"
                  />
                </div>
              )}
              <ul
                id={listId}
                role="listbox"
                aria-labelledby={triggerId}
                className="overflow-y-auto overscroll-contain p-1 scrollbar-thin"
                style={{ maxHeight: place.maxHeight - (searchable ? 45 : 0) }}
              >
                {shown.length === 0 ? (
                  <li className="px-3 py-2.5 text-[13px] text-ink-3">{emptyText}</li>
                ) : (
                  shown.map((o, i) => {
                    const isActive = i === active;
                    const isSelected = o.value === value;
                    return (
                      <li
                        key={o.value}
                        id={`${listId}-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={isSelected}
                        onPointerMove={() => setActive(i)}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => choose(o)}
                        className={`flex cursor-default select-none items-center gap-2 rounded-lg py-2 pl-2 pr-3 text-sm ${
                          isActive ? "bg-indigo-600 text-white" : "text-ink"
                        }`}
                      >
                        <Check
                          className={`h-4 w-4 shrink-0 ${isSelected ? "" : "invisible"} ${isActive ? "text-white" : "text-brand"}`}
                          strokeWidth={2.5}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{o.label}</span>
                          {o.description && (
                            <span className={`block truncate text-xs ${isActive ? "text-white/80" : "text-ink-3"}`}>{o.description}</span>
                          )}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
};

export default Select;
