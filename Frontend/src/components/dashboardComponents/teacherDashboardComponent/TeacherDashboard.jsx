import React, { useState } from 'react';
import { FaChalkboardTeacher, FaUserGraduate, FaBook, FaChartBar, FaCog, FaStar, FaBars, FaTimes, FaSignOutAlt, FaChevronRight } from 'react-icons/fa';
import store from '../../../zustand/loginStore';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import axios from 'axios';
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../../config/env";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { loginUserData, logoutUser } = store(state => state);
  // Determine active tab from current path
  const getActiveTab = (path) => {
    if (path === '/teacherdashboard') return 'Home';
    const segment = path.split('/').pop();
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(`${API_BASE_URL}/users/logout`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      message.success(response.data.message);
      logoutUser();

    } catch (error) {
      message.error(error.message);
    }
  }

  const [activeTab, setActiveTab] = useState(getActiveTab(location.pathname));

  const changeTab = (tabName, path) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
    navigate(path);
  };

  const navItems = [
    { name: 'Home', icon: FaChalkboardTeacher, path: '/teacherdashboard' },
    { name: 'Attendance', icon: FaUserGraduate, path: '/teacherdashboard/attendance' },
    { name: 'Assignment', icon: FaBook, path: '/teacherdashboard/assignment' },
    { name: 'Reports', icon: FaChartBar, path: '/teacherdashboard/reports' },
    { name: 'HolidayAnnoucement', icon: FaStar, path: '/teacherdashboard/holiday-annoucement' },
    { name: 'Settings', icon: FaCog, path: '/teacherdashboard/settings' },
  ];
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`bg-gradient-to-br from-blue-600 to-teal-500 text-white w-64 fixed h-full z-20 transition-all duration-300 ease-in-out flex flex-col shadow-2xl ${isSidebarOpen ? 'left-0' : '-left-64'} md:left-0 backdrop-blur-lg bg-opacity-90`}>
          <div className="flex-grow">
            <div className="flex items-center justify-between p-4 md:hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold tracking-wider"
              >
                👩🏫 EduPro
              </motion.div>
              <button onClick={toggleSidebar} className="text-white transition-colors hover:text-blue-200">
                <FaTimes size={24} />
              </button>
            </div>

            <motion.div
              className="px-6 py-8 border-b border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                  <span className="text-xl font-bold">👨🏫</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Mr. {loginUserData.fullName}</h1>
                  <p className="text-sm text-blue-100/80">Educator Profile</p>
                </div>
              </div>
            </motion.div>

            <nav className="px-4 mt-6 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => changeTab(item.name, item.path)}
                  className={`flex items-center w-full p-3 rounded-xl transition-all
            ${activeTab === item.name
                      ? "bg-white/20 backdrop-blur-sm shadow-lg"
                      : "hover:bg-white/10"
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3 text-blue-100" />
                  <span className="font-medium tracking-wide">{item.name}</span>
                </motion.button>
              ))}
            </nav>
          </div>

          <motion.div
            className="p-4 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-3 transition-all rounded-lg bg-white/5 hover:bg-white/10 group"
            >
              <div className="flex items-center">
                <FaSignOutAlt className="mr-3 text-blue-100" />
                <span className="font-medium">Log Out</span>
              </div>
              <FaChevronRight className="text-sm text-blue-100 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 ease-in-out md:ml-64">
          <header className="p-4 shadow-md bg-stone-300 md:hidden">
            <button onClick={toggleSidebar} className="text-gray-800">
              <FaBars size={24} />
            </button>
          </header>
          <div className="p-1">
            <motion.header
              className="px-3 py-4 mx-1 my-1 shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-500 
    sm:px-6 md:px-8 md:py-8 rounded-[0.75rem] sm:rounded-[1rem] backdrop-blur-sm bg-opacity-90 
    border border-white/20"
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <div className="max-w-6xl mx-auto">
                <h2 className="flex items-center gap-2 mb-2 text-2xl font-bold text-transparent sm:text-3xl md:text-4xl lg:text-5xl bg-clip-text bg-gradient-to-r from-white to-purple-100">
                  <span className="truncate">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                  </span>
                  <span className="flex-shrink-0 text-xl sm:text-2xl md:text-3xl">👩🏫</span>
                </h2>
                <motion.div
                  className={`space-y-1 ${activeTab === 'Home' ? 'block' : 'hidden'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeTab === 'Home' ? 1 : 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-medium sm:text-base md:text-lg text-purple-100/90">
                    Shaping young minds, one lesson at a time
                  </p>
                  <p className="text-xs font-normal sm:text-sm text-purple-100/80">
                    Welcome back, Prof. {loginUserData?.fullName}
                  </p>
                </motion.div>
              </div>
            </motion.header>
            <Outlet className="rounded-xl" context={{ changeTab }} />
          </div>
        </main>

      </div>

    </>
  );
};

export default TeacherDashboard;