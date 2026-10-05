import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { message } from "antd";
import store from "../../zustand/loginStore";
import api from "../../lib/api";
import { ThemeProvider } from "../../theme/ThemeProvider";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileNavigation from "./MobileNavigation";
import { currentPage, navigation } from "./navigation";

const COLLAPSE_KEY = "sidebar-collapsed";

const Shell = ({ role }) => {
  const config = navigation[role];
  const location = useLocation();
  const navigate = useNavigate();
  const { loginUserData, logoutUser } = store((state) => state);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  // Same contract as before: tell the API, then clear the store, which makes
  // ProtectedRouter send the user to /login.
  const handleLogout = async () => {
    try {
      const response = await api.post("/users/logout", {});
      message.success(response.data.message);
      logoutUser();
    } catch (error) {
      message.error("We couldn't sign you out. Please try again.");
    }
  };

  const page = currentPage(location.pathname, config);

  return (
    <div className="dashboard-root min-h-screen" data-role={role}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-pop"
      >
        Skip to content
      </a>

      <Sidebar config={config} user={loginUserData} collapsed={collapsed} onLogout={handleLogout} />

      <div className={`transition-[padding] duration-200 ease-apple ${collapsed ? "md:pl-[72px]" : "md:pl-[72px] lg:pl-60"}`}>
        <TopHeader
          config={config}
          page={page}
          user={loginUserData}
          onLogout={handleLogout}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
        />
        <main
          id="main"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1680px] px-3 pb-28 pt-4 outline-none sm:px-4 md:pb-10 md:pt-5 lg:px-6"
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Outlet context={{ changeTab: (_name, path) => navigate(path) }} />
          </motion.div>
        </main>
      </div>

      <MobileNavigation config={config} onLogout={handleLogout} />
    </div>
  );
};

const DashboardLayout = ({ role }) => (
  <ThemeProvider>
    <Shell role={role} />
  </ThemeProvider>
);

export default DashboardLayout;
