import { useState, useEffect } from 'react';
import loginImage from '../assets/login.png';
import logo from '../assets/Logo.svg';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import axios from 'axios';
import { message } from 'antd';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { ReactTyped } from 'react-typed';
import store from '../zustand/loginStore';
import { API_BASE_URL } from "../config/env";

const schema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email("Please enter valid email format"),
  password: z.string()
    .min(3, { message: "Password must be at least 3 characters" })
});

const Login = () => {
  const { setLoggedInUser, isLogin, loginUserData } = store(state => ({
    setLoggedInUser: state.setLoggedInUser,
    isLogin: state.isLogin,
    loginUserData: state.loginUserData
  }));

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (isLogin && loginUserData?.role) {
      const dashboardPath = loginUserData.role === "Teacher"
        ? "/teacherdashboard"
        : "/studentdashboard";
      navigate(dashboardPath, { replace: true });
    }
  }, [isLogin, loginUserData.role, navigate]);

  const submitHandle = async (formData) => {
    try {
      setIsLoggingIn(true);
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email: formData.email,
        password: formData.password,
      });

      const userData = response.data.data.loginUser;
      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;

      if (!userData?.role) {
        throw new Error("Invalid user data received");
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update Zustand store
      setLoggedInUser(userData, accessToken, refreshToken);

      message.success(response.data?.message);

    } catch (error) {
      console.error(error);
      message.error(error.response?.data?.message || "Login failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Create a custom axios instance with interceptors
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
  });

  // Add a request interceptor to include the access token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add a response interceptor for token refresh
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Check if the error is due to token expiration and not already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Call the backend refresh token endpoint
          const response = await axios.post(
            `${API_BASE_URL}/users/refreshtoken`,
            { refreshToken: localStorage.getItem('refreshToken') },
            { withCredentials: true }
          );

          const { accessToken, refreshToken } = response.data.data;

          // Update stored tokens
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Update authorization header for the original request
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Logout user if refresh fails
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex items-center justify-center min-h-screen px-4 py-10 overflow-hidden bg-slate-950"
    >
      {/* Ambient background, consistent with the landing page hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)',
        }}
      />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full bg-blue-600/10 blur-[110px]" />

      <div className="relative flex flex-col w-full max-w-6xl overflow-hidden border md:flex-row rounded-3xl border-white/10 bg-white/[0.02] shadow-2xl shadow-black/40 backdrop-blur-sm">
        {/* Brand / illustration panel */}
        <motion.div
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="relative flex-col justify-center hidden p-10 md:w-1/2 md:flex border-r border-white/10 bg-white/[0.015]"
        >
          <div className="relative z-10 space-y-8">
            <div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
                <ReactTyped strings={["Secure academic access."]} typeSpeed={40} showCursor={false} />
              </h1>
              <p className="mt-3 text-[15px] text-slate-400">AI-verified attendance, built for faculty.</p>
            </div>

            <div className="relative overflow-hidden border rounded-2xl border-white/10">
              <img
                src={loginImage}
                alt="AttendEase faculty login"
                className="w-full max-w-md mx-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 border rounded-xl border-white/10 bg-white/[0.02]">
                <div className="font-mono text-xl font-semibold text-white">99.6%</div>
                <div className="text-[11.5px] text-slate-500 mt-1">Accuracy</div>
              </div>
              <div className="p-4 border rounded-xl border-white/10 bg-white/[0.02]">
                <div className="font-mono text-xl font-semibold text-white">0.2s</div>
                <div className="text-[11.5px] text-slate-500 mt-1">Recognition</div>
              </div>
              <div className="p-4 border rounded-xl border-white/10 bg-white/[0.02]">
                <div className="font-mono text-xl font-semibold text-white">256-bit</div>
                <div className="text-[11.5px] text-slate-500 mt-1">Encryption</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form panel */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="p-8 md:w-1/2 md:p-12 lg:p-14"
        >
          <div className="flex items-center gap-3 mb-9">
            <img src={logo} alt="AttendEase logo" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-semibold tracking-tight text-white">AttendEase</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              <ReactTyped strings={["Faculty portal access"]} typeSpeed={40} showCursor={false} />
            </h2>
            <p className="mt-2 text-[13.5px] text-slate-500 flex items-center gap-1.5">
              <FiShield className="w-3.5 h-3.5 text-blue-400" />
              Encrypted session, verified on every request
            </p>
          </div>

          <form onSubmit={handleSubmit(submitHandle)} className="space-y-6">
            {/* Email Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiMail className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="Academic email"
                  className="w-full py-3.5 pl-11 pr-4 text-[14.5px] text-white transition-colors border rounded-xl bg-white/[0.03] border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-1.5 text-[12.5px] text-rose-400"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiLock className="w-4 h-4 text-slate-500" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className="w-full py-3.5 pl-11 pr-4 text-[14.5px] text-white transition-colors border rounded-xl bg-white/[0.03] border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mt-1.5 text-[12.5px] text-rose-400"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 text-[14.5px] font-medium text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span className="flex items-center justify-center">
                {isLoggingIn ? (
                  <span className="flex items-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                      className="block w-4 h-4 border-2 rounded-full border-white/40 border-t-white"
                    />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    Continue Session
                    <FiArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </motion.button>

            {/* Additional Links */}
            <div className="flex flex-col items-center pt-2 space-y-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-[13.5px] font-medium transition-colors text-slate-400 hover:text-slate-200"
              >
                New faculty? <span className="text-blue-400">Request access</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;