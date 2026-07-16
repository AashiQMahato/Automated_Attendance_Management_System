import React, { useState } from "react";
import {
  FaUserGraduate,
  FaHome,
  FaCalendarAlt,
  FaStar,
  FaClipboardCheck,
  FaTimes,
  FaBars,
  FaSignOutAlt,
  FaChevronRight,
} from "react-icons/fa";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import store from "../../../zustand/loginStore";
import axios from "axios";
import { message } from "antd";
import { motion, AnimatePresence } from "framer-motion";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loginUserData, logoutUser } = store((state) => state);

  const changeTab = (tabName, path) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `${loginUserData.baseURL}/users/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      message.success(response.data.message);
      logoutUser();
    } catch (error) {
      message.error(error.message);
    }
  };

  const getActiveTab = (path) => {
    if (path === "/studentdashboard") return "Home";
    const segment = path.split("/").pop();
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  const navItems = [
    { name: "Home", path: "/studentdashboard", icon: FaHome },
    { name: "Calendar", path: "/studentdashboard/calendar", icon: FaCalendarAlt },
    { name: "Assignments", path: "/studentdashboard/assignments", icon: FaUserGraduate },
    { name: "Holidays", path: "/studentdashboard/holidays", icon: FaStar },
    { name: "Attendance", path: "/studentdashboard/attendance", icon: FaClipboardCheck },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const initials = (loginUserData?.fullName || "S")
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-20 bg-slate-900/40 md:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed z-30 flex h-full w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Brand row */}
        <div className="flex items-center justify-between h-16 px-5 border-b shrink-0 border-slate-200">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-indigo-600 rounded-lg">
              E
            </div>
            <span className="text-[15px] font-semibold text-slate-900">EduSync</span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
            aria-label="Close sidebar"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* User summary */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200">
          <div
            className="flex items-center justify-center text-sm font-semibold text-indigo-600 rounded-full h-9 w-9 shrink-0 bg-indigo-50"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-slate-900">
              {loginUserData.fullName}
            </p>
            <p className="text-xs text-slate-500">Student account</p>
          </div>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Primary">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => changeTab(item.name, item.path)}
                aria-current={isActive ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Log out */}
        <div className="p-3 border-t shrink-0 border-slate-200">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium transition-colors rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            <span className="flex items-center gap-3">
              <FaSignOutAlt className="w-4 h-4" aria-hidden="true" />
              Log out
            </span>
            <FaChevronRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 md:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center h-16 gap-4 px-4 border-b shrink-0 border-slate-200 bg-white/80 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 md:hidden"
            aria-label="Open sidebar"
          >
            <FaBars size={18} />
          </button>
          <div>
            <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
              Dashboard
            </p>
            <h1 className="text-lg font-semibold leading-tight text-slate-900">{activeTab}</h1>
          </div>
        </header>

        {activeTab === "Home" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 py-4 bg-white border-b shrink-0 border-slate-200 sm:px-6"
          >
            <p className="text-sm text-slate-500">
              Your learning journey starts here — ready to explore, {loginUserData.fullName}?
            </p>
          </motion.div>
        )}

        {/* Routed content */}
        <main className="flex-1 p-4 overflow-y-auto sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;