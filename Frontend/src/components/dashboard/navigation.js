import { BarChart3, CalendarDays, CalendarRange, ClipboardList, LayoutGrid, ScanFace, Settings, UserCheck } from "lucide-react";

// Paths match the routes in Webroutes.jsx. `mobile: true` items appear in the
// bottom tab bar; the rest live under "More".
export const navigation = {
  Student: {
    base: "/studentdashboard",
    workspace: "Student",
    items: [
      { name: "Overview", path: "/studentdashboard", icon: LayoutGrid, mobile: true },
      { name: "Attendance", path: "/studentdashboard/attendance", icon: UserCheck, mobile: true },
      { name: "Assignments", path: "/studentdashboard/assignments", icon: ClipboardList, mobile: true },
      { name: "Calendar", path: "/studentdashboard/calendar", icon: CalendarDays, mobile: true },
      { name: "Holidays", path: "/studentdashboard/holidays", icon: CalendarRange },
    ],
    settingsPath: "/studentdashboard/settings",
    holidaysPath: "/studentdashboard/holidays",
  },
  Teacher: {
    base: "/teacherdashboard",
    workspace: "Teacher",
    items: [
      { name: "Overview", path: "/teacherdashboard", icon: LayoutGrid, mobile: true },
      { name: "Take attendance", short: "Attendance", path: "/teacherdashboard/attendance", icon: ScanFace, mobile: true },
      { name: "Reports", path: "/teacherdashboard/reports", icon: BarChart3, mobile: true },
      { name: "Assignments", path: "/teacherdashboard/assignment", icon: ClipboardList, mobile: true },
      { name: "Holidays", path: "/teacherdashboard/holiday-annoucement", icon: CalendarRange },
    ],
    settingsPath: "/teacherdashboard/settings",
    holidaysPath: "/teacherdashboard/holiday-annoucement",
  },
};

export const settingsItem = { name: "Settings", icon: Settings };

export const isActivePath = (pathname, item, base) => {
  const p = pathname.toLowerCase().replace(/\/+$/, "");
  const target = item.path.toLowerCase();
  return target === base ? p === base : p === target || p.startsWith(`${target}/`);
};

export const currentPageName = (pathname, config) => {
  const all = [...config.items, { ...settingsItem, path: config.settingsPath }];
  const match = all.find((item) => isActivePath(pathname, item, config.base));
  return match?.name || "Overview";
};
