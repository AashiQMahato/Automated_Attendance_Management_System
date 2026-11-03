import { Suspense, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { message } from "antd";
import store from "../../zustand/loginStore";
import api from "../../lib/api";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import MobileNavigation from "./MobileNavigation";
import { currentPage, navigation } from "./navigation";
import AmbientBackground from "../ui/AmbientBackground";

const COLLAPSE_KEY = "sidebar-collapsed";

// Shown while a page's code loads: a header-shaped glass placeholder.
const PageFallback = () => (
  <div className="space-y-4" role="status" aria-label="Loading page">
    <div className="glass-panel h-[104px] rounded-panel" />
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="glass-panel h-[120px] rounded-panel" />
      ))}
    </div>
  </div>
);

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
    <div className="dashboard-root relative min-h-screen" data-role={role}>
      <AmbientBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-pop"
      >
        Skip to content
      </a>

      <Sidebar config={config} user={loginUserData} collapsed={collapsed} onLogout={handleLogout} />

      {/* Sidebar floats 12px from the edge: rail 76px (+24 gutter), full 248px. */}
      <div className={`transition-[padding] duration-300 ease-apple ${collapsed ? "md:pl-[100px]" : "md:pl-[100px] lg:pl-[272px]"}`}>
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
          className="mx-auto w-full max-w-[1600px] px-3 pb-32 pt-4 outline-none sm:px-4 md:pb-10 md:pr-3 md:pt-5 lg:pl-1 lg:pr-4"
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
          >
            {/* Pages load on demand; the shell stays put meanwhile. */}
            <Suspense fallback={<PageFallback />}>
              <Outlet context={{ changeTab: (_name, path) => navigate(path) }} />
            </Suspense>
          </motion.div>
        </main>
      </div>

      <MobileNavigation config={config} onLogout={handleLogout} />
    </div>
  );
};

const DashboardLayout = ({ role }) => <Shell role={role} />;

export default DashboardLayout;
