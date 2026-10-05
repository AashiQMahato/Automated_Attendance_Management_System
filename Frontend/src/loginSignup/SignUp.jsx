import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from 'axios';
import { message } from 'antd';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiBookOpen, FiArrowRight, FiKey } from 'react-icons/fi';
import { FaChalkboardTeacher, FaUserGraduate, FaGraduationCap } from 'react-icons/fa';
import { API_BASE_URL } from "../config/env";

const schema = z.object({
  email: z.string().min(1, { message: "Email is required" }).email("please enter valid format of email"),
  password: z.string().min(1, { message: "Password is required" }),
  confirmPassword: z.string().min(1, { message: 'confirm the password' }),
  role: z.string().min(1, { message: "role is required" }),
  fullName: z.string().min(1, { message: "full name is required" }),
  semester: z.preprocess(
    (value) => (typeof value === "string" ? parseInt(value, 10) : value),
    z.number()
      .min(1, { message: "Semester must be at least 1" })
      .max(8, { message: "Semester must not exceed 8" })
  )
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema)
  })

  const submitHandle = async (data) => {
    try {
      setLoading(true);

      // Make the API call
      const response = await axios.post(`${API_BASE_URL}/users/signup`, {
        email: data.email,
        password: data.password,
        role: data.role,
        fullName: data.fullName,
        semester: data.semester
      });

      // Check if the response is valid
      if (!response || !response.data) {
        throw new Error("Invalid response from server");
      }

      // Navigate to login page on success
      navigate("/login");
      message.success(response.data.message || "Account created successfully!");
    } catch (error) {
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        message.error(error.response.data.message || "Signup failed. Please try again.");
      } else if (error.request) {
        // The request was made but no response was received
        message.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request
        message.error("An unexpected error occurred. Please try again.");
      }
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 }
  };

  const inputClass =
    "w-full py-3.5 pl-11 pr-4 text-[14.5px] text-white transition-colors border rounded-xl bg-white/[0.03] border-white/10 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 focus:ring-4 focus:ring-blue-500/10";

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

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="relative w-full max-w-6xl"
      >
        <div className="grid overflow-hidden border md:grid-cols-2 rounded-3xl border-white/10 bg-white/[0.02] shadow-2xl shadow-black/40 backdrop-blur-sm">
          {/* Left column — form */}
          <div className="p-8 lg:p-12">
            <motion.div {...fadeInUp} className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-white">Create your account</h1>
              <p className="mt-2 text-[14px] text-slate-500">Join AttendEase as faculty or student.</p>
            </motion.div>

            <form onSubmit={handleSubmit(submitHandle)} className="space-y-5">
              {/* Role Selection Cards */}
              <motion.div {...fadeInUp} className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="radio"
                    {...register("role")}
                    value="Teacher"
                    id="teacher-role"
                    className="hidden peer"
                  />
                  <label
                    htmlFor="teacher-role"
                    className="flex flex-col items-center gap-2 p-4 transition-colors border cursor-pointer rounded-xl border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 peer-checked:border-blue-400/60 peer-checked:bg-blue-500/[0.06] peer-checked:text-white"
                  >
                    <FaChalkboardTeacher className="w-6 h-6" />
                    <span className="text-[13.5px] font-medium">Teacher</span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="radio"
                    {...register("role")}
                    value="Student"
                    id="student-role"
                    className="hidden peer"
                  />
                  <label
                    htmlFor="student-role"
                    className="flex flex-col items-center gap-2 p-4 transition-colors border cursor-pointer rounded-xl border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 peer-checked:border-blue-400/60 peer-checked:bg-blue-500/[0.06] peer-checked:text-white"
                  >
                    <FaUserGraduate className="w-6 h-6" />
                    <span className="text-[13.5px] font-medium">Student</span>
                  </label>
                </div>
              </motion.div>
              {errors.role && (
                <p className="text-[12.5px] text-rose-400 -mt-2">{errors.role.message}</p>
              )}

              <motion.div {...fadeInUp} className="space-y-4">
                {/* Full Name Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FiUser className="w-4 h-4 text-slate-500" />
                    </div>
                    <input {...register("fullName")} type="text" placeholder="Full name" className={inputClass} />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1.5 text-[12.5px] text-rose-400">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FiMail className="w-4 h-4 text-slate-500" />
                    </div>
                    <input {...register("email")} type="email" placeholder="Email address" className={inputClass} />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-[12.5px] text-rose-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Semester Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FiBookOpen className="w-4 h-4 text-slate-500" />
                    </div>
                    <input {...register("semester")} type="number" placeholder="Semester (1–8)" className={inputClass} />
                  </div>
                  {errors.semester && (
                    <p className="mt-1.5 text-[12.5px] text-rose-400">{errors.semester.message}</p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FiKey className="w-4 h-4 text-slate-500" />
                    </div>
                    <input {...register("password")} type="password" placeholder="Password" className={inputClass} />
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[12.5px] text-rose-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <FiLock className="w-4 h-4 text-slate-500" />
                    </div>
                    <input {...register("confirmPassword")} type="password" placeholder="Confirm password" className={inputClass} />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-[12.5px] text-rose-400">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </motion.div>

              {/* Sign Up Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 text-[14.5px] font-medium text-white transition-colors bg-blue-600 rounded-xl hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>{loading ? 'Creating account...' : 'Create account'}</span>
                  <FiArrowRight className={`w-4 h-4 transition-transform ${loading ? 'translate-x-1' : ''}`} />
                </span>
              </motion.button>

              {/* Login Link */}
              <p className="text-center text-[13.5px] text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>

          {/* Right column — feature highlights */}
          <div className="relative hidden md:block border-l border-white/10 bg-white/[0.015]">
            <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            <div className="relative flex flex-col justify-center h-full p-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="mb-8 text-3xl font-semibold tracking-tight text-white">Welcome to AttendEase</h2>

                <div className="space-y-4">
                  <div className="p-5 transition-colors border rounded-2xl border-white/10 bg-white/[0.02] hover:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2.5 mb-2 text-[15px] font-medium text-white">
                      <span className="flex items-center justify-center rounded-lg w-9 h-9 bg-blue-500/10">
                        <FaGraduationCap className="w-4 h-4 text-blue-400" />
                      </span>
                      Smart attendance
                    </h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      Automated, face-verified attendance that saves time and closes the gap on proxies.
                    </p>
                  </div>

                  <div className="p-5 transition-colors border rounded-2xl border-white/10 bg-white/[0.02] hover:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2.5 mb-2 text-[15px] font-medium text-white">
                      <span className="flex items-center justify-center rounded-lg w-9 h-9 bg-blue-500/10">
                        <FaChalkboardTeacher className="w-4 h-4 text-blue-400" />
                      </span>
                      Easy management
                    </h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      A scoped view for every instructor to manage sections and track student progress.
                    </p>
                  </div>

                  <div className="p-5 transition-colors border rounded-2xl border-white/10 bg-white/[0.02] hover:bg-white/[0.04]">
                    <h3 className="flex items-center gap-2.5 mb-2 text-[15px] font-medium text-white">
                      <span className="flex items-center justify-center rounded-lg w-9 h-9 bg-blue-500/10">
                        <FiBookOpen className="w-4 h-4 text-blue-400" />
                      </span>
                      Real-time analytics
                    </h3>
                    <p className="text-[13.5px] text-slate-500 leading-relaxed">
                      Instant visibility into attendance patterns and engagement, per course or section.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignUp;