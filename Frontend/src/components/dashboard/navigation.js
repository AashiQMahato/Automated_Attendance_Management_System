import { BarChart3, BookOpen, CalendarDays, CalendarRange, ClipboardList, LayoutGrid, ScanFace, Settings, UserCheck, Users } from "lucide-react";

// Paths match the routes in Webroutes.jsx. `mobile: true` items appear in the
// bottom tab bar; the rest live under "More".
export const navigation = {
  Student: {
    base: "/studentdashboard",
    workspace: "Student",
    items: [
      { name: "Overview", path: "/studentdashboard", icon: LayoutGrid, color: "emerald", mobile: true, group: "Home" },
      { name: "Attendance", path: "/studentdashboard/attendance", icon: UserCheck, color: "teal", mobile: true, group: "Academics" },
      { name: "Assignments", path: "/studentdashboard/assignments", icon: ClipboardList, color: "amber", mobile: true, group: "Academics" },
      { name: "Calendar", path: "/studentdashboard/calendar", icon: CalendarDays, color: "sky", mobile: true, group: "Schedule" },
      { name: "Holidays", path: "/studentdashboard/holidays", icon: CalendarRange, color: "rose", group: "Schedule" },
    ],
    settingsPath: "/studentdashboard/settings",
    holidaysPath: "/studentdashboard/holidays",
  },
  Teacher: {
    base: "/teacherdashboard",
    workspace: "Teacher",
    items: [
      { name: "Overview", path: "/teacherdashboard", icon: LayoutGrid, color: "sky", mobile: true, group: "Home" },
      { name: "Take attendance", short: "Attendance", path: "/teacherdashboard/attendance", icon: ScanFace, color: "indigo", mobile: true, group: "Attendance" },
      { name: "Reports", path: "/teacherdashboard/reports", icon: BarChart3, color: "violet", mobile: true, group: "Attendance" },
      { name: "Assignments", path: "/teacherdashboard/assignment", icon: ClipboardList, color: "amber", mobile: true, group: "Classroom" },
      { name: "Holidays", path: "/teacherdashboard/holiday-annoucement", icon: CalendarRange, color: "rose", group: "Classroom" },
    ],
    settingsPath: "/teacherdashboard/settings",
    holidaysPath: "/teacherdashboard/holiday-annoucement",
  },
  Admin: {
    base: "/admindashboard",
    workspace: "Admin",
    items: [
      { name: "Accounts", path: "/admindashboard", icon: Users, color: "indigo", mobile: true, group: "Manage" },
      { name: "Subjects", path: "/admindashboard/subjects", icon: BookOpen, color: "violet", mobile: true, group: "Manage" },
    ],
    settingsPath: "/admindashboard/settings",
  },
};

// Where each role lands after signing in.
export const homePath = (role) => navigation[role]?.base || "/login";

export const settingsItem = { name: "Settings", icon: Settings, color: "violet" };

export const isActivePath = (pathname, item, base) => {
  const p = pathname.toLowerCase().replace(/\/+$/, "");
  const target = item.path.toLowerCase();
  return target === base ? p === base : p === target || p.startsWith(`${target}/`);
};

// Items bucketed by `group`, in first-seen order, for the sidebar.
export const groupItems = (items) =>
  items.reduce((groups, item) => {
    const name = item.group || "";
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(item);
    else groups.push({ name, items: [item] });
    return groups;
  }, []);

export const allItems = (config) => [...config.items, { ...settingsItem, path: config.settingsPath }];

export const currentPage = (pathname, config) =>
  allItems(config).find((item) => isActivePath(pathname, item, config.base)) || config.items[0];
