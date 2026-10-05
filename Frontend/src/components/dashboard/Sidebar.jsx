import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import logo from "../../assets/Logo.svg";
import Avatar from "../ui/Avatar";
import { isActivePath, settingsItem } from "./navigation";

// Below lg the sidebar is always a compact icon rail; at lg+ the user can
// collapse it. `collapsed` is that lg+ preference.
const NavItem = ({ item, active, collapsed }) => {
  const Icon = item.icon;
  const labelClass = collapsed ? "sr-only" : "sr-only lg:not-sr-only";
  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      className={`focus-ring group relative flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors duration-150 ${
        active ? "text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      } ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-surface-2 ring-1 ring-line"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          aria-hidden="true"
        />
      )}
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand" aria-hidden="true" />}
      <Icon
        className={`relative h-[18px] w-[18px] shrink-0 ${active ? "text-brand" : "text-ink-3 group-hover:text-ink-2"}`}
        aria-hidden="true"
      />
      <span className="relative z-[1] min-w-0">
        <span className={`block truncate ${labelClass}`}>{item.name}</span>
      </span>
      {/* Tooltip for the icon rail */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
          collapsed ? "" : "lg:hidden"
        }`}
      >
        {item.name}
      </span>
    </Link>
  );
};

const Sidebar = ({ config, user, collapsed, onToggleCollapsed, onLogout }) => {
  const { pathname } = useLocation();
  const settings = { ...settingsItem, path: config.settingsPath };
  const showLabels = collapsed ? "hidden" : "hidden lg:block";

  return (
    <aside
      aria-label="Sidebar"
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface md:flex ${
        collapsed ? "w-[68px]" : "w-[68px] lg:w-60"
      } transition-[width] duration-200 ease-apple`}
    >
      <div className={`flex h-14 shrink-0 items-center gap-2.5 px-4 ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}>
        <img src={logo} alt="" className="h-7 w-7 rounded-md" />
        <span className={`text-[15px] font-semibold tracking-[-0.01em] text-ink ${showLabels}`}>AttendEase</span>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-0.5 px-3 pt-3">
        <p className={`px-2.5 pb-2 text-[11px] font-medium uppercase tracking-wider text-ink-3 ${showLabels}`}>{config.workspace}</p>
        {config.items.map((item) => (
          <NavItem key={item.path} item={item} active={isActivePath(pathname, item, config.base)} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-0.5 border-t border-line px-3 py-3">
        <NavItem item={settings} active={isActivePath(pathname, settings, config.base)} collapsed={collapsed} />
        <button
          type="button"
          onClick={onLogout}
          className={`focus-ring group relative flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-medium text-ink-2 transition-colors hover:bg-danger/10 hover:text-danger ${
            collapsed ? "justify-center" : "justify-center lg:justify-start"
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 text-ink-3 group-hover:text-danger" aria-hidden="true" />
          <span className={collapsed ? "sr-only" : "sr-only lg:not-sr-only"}>Log out</span>
        </button>

        <div className={`mt-2 items-center gap-2.5 rounded-lg px-2.5 py-2 ${collapsed ? "hidden" : "hidden lg:flex"}`}>
          <Avatar name={user.fullName} src={user.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user.fullName}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          className="focus-ring mt-1 hidden h-8 w-full items-center justify-center gap-2 rounded-lg text-xs font-medium text-ink-3 hover:bg-surface-2 hover:text-ink-2 lg:flex"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
