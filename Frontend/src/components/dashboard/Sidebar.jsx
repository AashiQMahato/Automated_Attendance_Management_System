import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import logo from "../../assets/Logo.svg";
import Avatar from "../ui/Avatar";
import { colors } from "../ui/colors";
import { groupItems, isActivePath, settingsItem } from "./navigation";

/*
  Floating Liquid Glass sidebar, inset from the window edges.
  - Below lg it is an icon rail; at lg+ `collapsed` is the user's preference
    (toggled from the top bar). Width animates; labels fade.
  - Each destination has a softly tinted icon tile; the active item gets a
    raised glass pill (shared layout animation) and a role-accent bar.
  - Collapsed mode shows glass tooltips on hover/focus.
*/
const railTooltip =
  "glass-pop pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-medium text-ink opacity-0 transition-[opacity,transform] duration-200 ease-apple group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100";

const labelClass = (collapsed) =>
  collapsed ? "sr-only" : "sr-only lg:not-sr-only lg:truncate lg:transition-opacity lg:duration-200";

const NavItem = ({ item, active, collapsed }) => {
  const Icon = item.icon;
  const tint = colors[item.color] || colors.indigo;
  return (
    <Link
      to={item.path}
      aria-current={active ? "page" : undefined}
      className={`focus-ring group relative flex h-11 items-center gap-3 rounded-2xl px-2 text-[14px] font-medium transition-colors duration-200 ${
        active ? "text-ink" : "text-ink-2 hover:bg-ink/[0.04] hover:text-ink dark:hover:bg-white/[0.05]"
      } ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-2xl bg-surface/90 shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_6px_16px_-8px_rgb(16_24_39/0.25)] ring-1 ring-black/[0.04] dark:bg-white/[0.09] dark:ring-white/[0.06]"
          transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
          aria-hidden="true"
        >
          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-x-[5px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_rgb(var(--accent)/0.7)]" />
        </motion.span>
      )}
      <span
        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] transition-[transform,background-color] duration-200 ease-apple group-hover:scale-105 ${
          active ? `${tint.tile} ring-1 ring-inset ring-white/50 dark:ring-white/5` : "text-ink-3 group-hover:text-ink-2"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.9} aria-hidden="true" />
      </span>
      <span className={`relative z-[1] min-w-0 ${labelClass(collapsed)}`}>{item.name}</span>
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
  const groups = groupItems(config.items);

  return (
    <aside
      aria-label="Sidebar"
      className={`glass-chrome fixed bottom-3 left-3 top-3 z-40 hidden flex-col overflow-visible rounded-[26px] md:flex ${
        collapsed ? "w-[76px]" : "w-[76px] lg:w-[248px]"
      } transition-[width] duration-300 ease-apple`}
    >
      {/* Brand */}
      <Link
        to={config.base}
        className={`focus-ring mx-3 mt-3 flex h-12 shrink-0 items-center gap-2.5 rounded-2xl px-2 ${collapsed ? "justify-center" : "justify-center lg:justify-start"}`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_4px_12px_-6px_rgb(16_24_39/0.3)] ring-1 ring-black/[0.04] dark:bg-white/10 dark:ring-white/10">
          <img src={logo} alt="" className="h-6 w-6" />
        </span>
        <span className={`min-w-0 leading-tight ${showLabels}`}>
          <span className="block text-[15px] font-semibold tracking-[-0.02em] text-ink">AttendEase</span>
          <span className="block text-[11px] font-medium text-accent">{config.workspace} workspace</span>
        </span>
        <span className="sr-only">AttendEase, {config.workspace} home</span>
      </Link>

      <nav aria-label="Primary" className="mt-3 flex-1 px-3 pb-2">
        {groups.map((group, gi) => (
          <div key={group.name || gi} className={gi > 0 ? "mt-4" : ""}>
            {group.name && (
              <p className={`px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3 ${showLabels}`}>{group.name}</p>
            )}
            {gi > 0 && (
              <span className={`mx-auto mb-3 block h-px w-8 bg-line ${collapsed ? "" : "lg:hidden"}`} aria-hidden="true" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.path} item={item} active={isActivePath(pathname, item, config.base)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-line/70 px-3 py-3">
        <NavItem item={settings} active={isActivePath(pathname, settings, config.base)} collapsed={collapsed} />
        <button
          type="button"
          onClick={onLogout}
          className={`focus-ring group relative flex h-11 w-full items-center gap-3 rounded-2xl px-2 text-[14px] font-medium text-ink-2 transition-colors hover:bg-danger/10 hover:text-danger ${
            collapsed ? "justify-center" : "justify-center lg:justify-start"
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
            <LogOut className="h-[18px] w-[18px] text-ink-3 transition-colors group-hover:text-danger" aria-hidden="true" />
          </span>
          <span className={labelClass(collapsed)}>Log out</span>
          <span aria-hidden="true" className={`${railTooltip} ${collapsed ? "" : "lg:hidden"}`}>
            Log out
          </span>
        </button>

        {/* Profile */}
        <Link
          to={config.settingsPath}
          className={`focus-ring glass-well mt-2 items-center gap-2.5 rounded-2xl p-2 transition-colors hover:bg-surface/80 ${collapsed ? "hidden" : "hidden lg:flex"}`}
        >
          <Avatar name={user.fullName} src={user.avatar} size="sm" className="ring-2 ring-accent/30" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">{user.fullName}</span>
            <span className="block truncate text-[11px] text-ink-3">{user.email}</span>
          </span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
