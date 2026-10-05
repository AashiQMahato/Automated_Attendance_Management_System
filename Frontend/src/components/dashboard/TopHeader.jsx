import React, { useEffect, useState } from "react";
import { ChevronRight, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import logo from "../../assets/Logo.svg";
import { colors } from "../ui/colors";
import Tooltip from "../ui/Tooltip";
import { NotificationsMenu, ProfileMenu, ThemeToggle } from "./HeaderMenus";
import CommandMenu, { isMac } from "./CommandMenu";

/*
  Apple-style toolbar:
  - A translucent material layer (blur + saturation) that content scrolls under,
    with a constant hairline at the bottom and a bright top edge, so it always
    reads as a distinct surface.
  - Depth grows on scroll (soft shadow), never a hard jump.
  - Wayfinding first: the current page's colored glyph + title.
  - Related controls grouped in one capsule; search / jump is the largest target.
*/
const TopHeader = ({ config, page, user, onLogout, collapsed, onToggleCollapsed }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const PageIcon = page.icon;
  const tint = colors[page.color || "indigo"];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ⌘K / Ctrl+K opens the jump menu from anywhere in the dashboard.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const SidebarIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <>
      <header
        className={`glass sticky top-0 z-30 border-b border-line bg-surface/75 backdrop-blur-2xl backdrop-saturate-[1.8] transition-shadow duration-300 dark:bg-surface/65 ${
          scrolled ? "shadow-[0_10px_30px_-18px_rgb(17_19_43/0.35)]" : "shadow-none"
        }`}
      >
        {/* Bright top edge: light catching the material */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/80 dark:bg-white/[0.06]" aria-hidden="true" />

        <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center gap-3 px-3 sm:px-4 lg:px-6">
          <img src={logo} alt="" className="h-8 w-8 rounded-lg md:hidden" />

          {/* Sidebar toggle (collapsing only applies at lg+) */}
          <Tooltip label={collapsed ? "Expand sidebar" : "Collapse sidebar"} side="bottom" className="hidden lg:inline-flex">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-2 transition-colors hover:bg-brand/[0.08] hover:text-brand"
            >
              <SidebarIcon className="h-[18px] w-[18px]" />
            </button>
          </Tooltip>
          <span className="hidden h-6 w-px bg-line lg:block" aria-hidden="true" />

          {/* Wayfinding: where am I */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl md:flex ${tint.tile}`}>
              <PageIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <nav aria-label="Breadcrumb" className="min-w-0">
              <ol className="flex flex-col leading-tight">
                <li className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 sm:flex">
                  {config.workspace}
                  <ChevronRight className="h-3 w-3" aria-hidden="true" />
                </li>
                <li className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink" aria-current="page">
                  {page.name}
                </li>
              </ol>
            </nav>
          </div>

          {/* Search / jump */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="focus-ring group hidden h-10 w-full max-w-[300px] items-center gap-2.5 rounded-xl border border-line bg-surface-2/70 px-3 text-sm text-ink-3 transition-colors hover:border-brand/30 hover:bg-surface md:flex"
            aria-label="Search and jump to a page"
            aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-brand" aria-hidden="true" />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-[11px] font-medium text-ink-3 shadow-xs">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search and jump to a page"
              className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-2 hover:bg-brand/[0.08] hover:text-brand md:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            {/* Grouped utilities capsule */}
            <div className="flex items-center gap-0.5 rounded-full border border-line bg-surface-2/70 p-1">
              <NotificationsMenu holidaysPath={config.holidaysPath} />
              <span className="h-5 w-px bg-line" aria-hidden="true" />
              <ThemeToggle />
            </div>

            <ProfileMenu user={user} settingsPath={config.settingsPath} onLogout={onLogout} />
          </div>
        </div>
      </header>

      <CommandMenu open={searchOpen} onClose={() => setSearchOpen(false)} config={config} />
    </>
  );
};

export default TopHeader;
