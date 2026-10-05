import { BarChart3, CalendarDays, CalendarRange, ClipboardList, LayoutGrid, ScanFace, Settings, UserCheck } from "lucide-react";

// Paths match the routes in Webroutes.jsx. `mobile: true` items appear in the
// bottom tab bar; the rest live under "More".
export const navigation = {
  Student: {
    base: "/studentdashboard",
    workspace: "Student",
    items: [
      { name: "Overview", path: "/studentdashboard", icon: LayoutGrid, color: "indigo", mobile: true },
      { name: "Attendance", path: "/studentdashboard/attendance", icon: UserCheck, color: "emerald", mobile: true },
      { name: "Assignments", path: "/studentdashboard/assignments", icon: ClipboardList, color: "amber", mobile: true },
      { name: "Calendar", path: "/studentdashboard/calendar", icon: CalendarDays, color: "sky", mobile: true },
      { name: "Holidays", path: "/studentdashboard/holidays", icon: CalendarRange, color: "rose" },
    ],
    settingsPath: "/studentdashboard/settings",
    holidaysPath: "/studentdashboard/holidays",
  },
  Teacher: {
    base: "/teacherdashboard",
    workspace: "Teacher",
    items: [
      { name: "Overview", path: "/teacherdashboard", icon: LayoutGrid, color: "indigo", mobile: true },
      { name: "Take attendance", short: "Attendance", path: "/teacherdashboard/attendance", icon: ScanFace, color: "indigo", mobile: true },
      { name: "Reports", path: "/teacherdashboard/reports", icon: BarChart3, color: "violet", mobile: true },
      { name: "Assignments", path: "/teacherdashboard/assignment", icon: ClipboardList, color: "amber", mobile: true },
      { name: "Holidays", path: "/teacherdashboard/holiday-annoucement", icon: CalendarRange, color: "rose" },
    ],
    settingsPath: "/teacherdashboard/settings",
    holidaysPath: "/teacherdashboard/holiday-annoucement",
  },
};

export const settingsItem = { name: "Settings", icon: Settings, color: "violet" };

export const isActivePath = (pathname, item, base) => {
  const p = pathname.toLowerCase().replace(/\/+$/, "");
  const target = item.path.toLowerCase();
  return target === base ? p === base : p === target || p.startsWith(`${target}/`);
};

export const allItems = (config) => [...config.items, { ...settingsItem, path: config.settingsPath }];

export const currentPage = (pathname, config) =>
  allItems(config).find((item) => isActivePath(pathname, item, config.base)) || config.items[0];
