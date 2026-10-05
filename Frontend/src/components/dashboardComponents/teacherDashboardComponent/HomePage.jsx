import React, { useState, useEffect } from "react";
import { Users, BookOpen } from 'lucide-react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import useAttendanceStore from "../../../zustand/attendanceStore.js";

import StudentStats from './StudentStats';
import ImageUploadForAttendance from './ImageUploadForAttendance';
import SubjectSetup from './SubjectSetup';
import { API_BASE_URL } from "../../../config/env";

const HomePage = () => {
    const { addAttendanceRecord } = useAttendanceStore();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');

                const response = await axios.get(`${API_BASE_URL}/subjects`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // Ensure we're setting an array
                const fetchedSubjects = response.data.data || [];
                setSubjects(fetchedSubjects);
                setError(null);
            } catch (error) {
                setSubjects([]);
                setError(error.response?.data?.message || 'Failed to fetch subjects');

                // Optional: Redirect to login if unauthorized
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [navigate]);

    const handleSubjectCreated = (newSubject) => {
        setSubjects(prevSubjects => [...prevSubjects, newSubject]);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (subjects.length === 0) {
        return <SubjectSetup onSubjectCreated={handleSubjectCreated} />;
    }

    return (
        <div className="min-h-screen p-6 rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            <div className="grid grid-cols-1 gap-6 mx-auto max-w-7xl lg:grid-cols-2">
                {/* Image Upload Component */}
                <ImageUploadForAttendance 
                    subjects={subjects}
                    addAttendanceRecord={addAttendanceRecord}
                />

                {/* Quick Actions Section */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-6 border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10"
                    >
                        <h3 className="mb-8 text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
                            Academic Dashboard
                        </h3>

                        <div className="space-y-6">
                            <motion.button
                                whileHover={{ y: -2 }}
                                className="w-full p-6 transition-all bg-white/5 rounded-xl hover:bg-white/10 group"
                                onClick={() => navigate('/teacherdashboard/attendance')}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-semibold text-blue-200">Live Attendance</h4>
                                        <p className="text-sm text-blue-300/80">Real-time tracking system</p>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ y: -2 }}
                                className="w-full p-6 transition-all bg-white/5 rounded-xl hover:bg-white/10 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="text-lg font-semibold text-blue-200">Assignment Hub</h4>
                                        <p className="text-sm text-blue-300/80">Create & manage tasks</p>
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Statistics Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10"
                    >
                        <h3 className="mb-6 text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text">
                            Student Insights
                        </h3>

                        <StudentStats />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
export default HomePage;