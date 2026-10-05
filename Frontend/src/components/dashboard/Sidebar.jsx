import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import logo from "../../assets/Logo.svg";
import Avatar from "../ui/Avatar";
import { isActivePath, settingsItem } from "./navigation";

// Quiet, neutral sidebar (surface + hairline border) so color lives in the
// content. The active item is a soft pill with a brand-colored glyph.
// Below lg it is an icon rail; at lg+ `collapsed` is the user's preference
// (toggled from the top bar).
const railTooltip =
  "pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-xs font-medium text-canvas opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100";

const NavItem = ({ item, active, collapsed }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      className={`focus-ring group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[14px] font-medium transition-colors duration-150 ${
        active ? "text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
      } ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-inset ring-line"
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
          aria-hidden="true"
        />
      )}
      <Icon
        className={`relative h-[18px] w-[18px] shrink-0 transition-colors ${active ? "text-brand" : "text-ink-3 group-hover:text-ink-2"}`}
        strokeWidth={active ? 2.2 : 1.9}
        aria-hidden="true"
      />
      <span className="relative z-[1] min-w-0">
        <span className={`block truncate ${collapsed ? "sr-only" : "sr-only lg:not-sr-only"}`}>{item.name}</span>
      </span>
      <span aria-hidden="true" className={`${railTooltip} ${collapsed ? "" : "lg:hidden"}`}>
        {item.name}
      </span>
    </Link>
  );
};

const Sidebar = ({ config, user, collapsed, onLogout }) => {
  const { pathname } = useLocation();
  const settings = { ...settingsItem, path: config.settingsPath };
  const showLabels = collapsed ? "hidden" : "hidden lg:block";

  return (
    <aside
      aria-label="Sidebar"
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface md:flex ${
        collapsed ? "w-[72px]" : "w-[72px] lg:w-60"
      } transition-[width] duration-200 ease-apple`}
    >
      <div
        className={`flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-4 ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}
      >
        <img src={logo} alt="" className="h-8 w-8 rounded-lg ring-1 ring-line" />
        <span className={`text-[15px] font-semibold tracking-[-0.02em] text-ink ${showLabels}`}>AttendEase</span>
      </div>

      <nav aria-label="Primary" className="flex-1 space-y-1.5 px-3 pt-4">
        <p className={`px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 ${showLabels}`}>{config.workspace}</p>
        {config.items.map((item) => (
          <NavItem key={item.path} item={item} active={isActivePath(pathname, item, config.base)} collapsed={collapsed} />
        ))}
      </nav>

      <div className="space-y-1.5 border-t border-line px-3 py-3">
        <NavItem item={settings} active={isActivePath(pathname, settings, config.base)} collapsed={collapsed} />
        <button
          type="button"
          onClick={onLogout}
          className={`focus-ring group relative flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[14px] font-medium text-ink-2 transition-colors hover:bg-danger/10 hover:text-danger ${
            collapsed ? "justify-center" : "justify-center lg:justify-start"
          }`}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 text-ink-3 group-hover:text-danger" aria-hidden="true" />
          <span className={collapsed ? "sr-only" : "sr-only lg:not-sr-only"}>Log out</span>
          <span aria-hidden="true" className={`${railTooltip} ${collapsed ? "" : "lg:hidden"}`}>
            Log out
          </span>
        </button>

        <div className={`mt-2 items-center gap-2.5 rounded-lg px-2.5 py-2 ${collapsed ? "hidden" : "hidden lg:flex"}`}>
          <Avatar name={user.fullName} src={user.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user.fullName}</p>
            <p className="truncate text-xs text-ink-3">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
