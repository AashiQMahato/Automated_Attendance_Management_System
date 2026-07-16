import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    CheckCircleFilled,
    CalendarFilled,
    PieChartFilled,
    FireFilled,
    TrophyFilled,
} from '@ant-design/icons';
import { Users, BookOpen, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import store from '../../../zustand/loginStore';

const StudentHomePage = () => {
    const navigate = useNavigate();
    const { loginUserData } = store((state) => state);
    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        totalClasses: 0,
        attendedClasses: 0,
    });
    const api = axios.create({
        baseURL: loginUserData.baseURL,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
    });

    useEffect(() => {
        const fetchSubjectsAndStats = async () => {
            try {
                const { data: subjectsResponse } = await api.get('/subjects');

                if (!subjectsResponse.data || subjectsResponse.data.length === 0) {
                    console.warn('No subjects found for the student.');
                    setLoading(false);
                    return;
                }

                const firstSubjectId = subjectsResponse.data[0]._id;
                const { data: subjectDetailsResponse } = await api.get(`/subjects/${firstSubjectId}`);

                const subjectDetails = subjectDetailsResponse.data;

                setSubjects(subjectsResponse.data);
                setStats({
                    attendancePercentage: subjectDetails.attendancePercentage || 0,
                    totalClasses: subjectDetails.totalClasses || 0,
                    attendedClasses: subjectDetails.attendedClasses || 0,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchSubjectsAndStats();
    }, [navigate]);

    const performanceStats = [
        {
            title: 'Attendance',
            value: `${stats.attendancePercentage}%`,
            icon: CheckCircleFilled,
            accent: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: 'Total Classes',
            value: stats.totalClasses,
            icon: CalendarFilled,
            accent: 'bg-indigo-50 text-indigo-600',
        },
        {
            title: 'Attended',
            value: stats.attendedClasses,
            icon: PieChartFilled,
            accent: 'bg-violet-50 text-violet-600',
        },
    ];

    const quickActions = [
        {
            title: 'Detailed Attendance',
            description: 'View your full class-by-class record',
            icon: Users,
            accent: 'bg-indigo-600',
        },
        {
            title: 'Course Materials',
            description: 'Access learning resources and notes',
            icon: BookOpen,
            accent: 'bg-emerald-600',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-busy="true" aria-live="polite">
                <div className="p-6 bg-white border rounded-xl border-slate-200">
                    <div className="w-48 h-5 mb-6 rounded animate-pulse bg-slate-100" />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="rounded-lg h-28 animate-pulse bg-slate-100" />
                        ))}
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="h-40 bg-white border animate-pulse rounded-xl border-slate-200" />
                    <div className="h-40 bg-white border animate-pulse rounded-xl border-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Performance overview */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-6 bg-white border shadow-sm rounded-xl border-slate-200"
                >
                    <div className="mb-6">
                        <h2 className="text-base font-semibold text-slate-900">Academic performance</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Comprehensive attendance metrics</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {performanceStats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={idx}
                                    className="p-4 transition-shadow border rounded-lg border-slate-200 hover:shadow-sm"
                                >
                                    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.accent}`}>
                                        <Icon className="text-base" aria-hidden="true" />
                                    </div>
                                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                                    <p className="text-xs text-slate-500">{stat.title}</p>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Quick actions & engagement */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.05 }}
                        className="p-6 bg-white border shadow-sm rounded-xl border-slate-200"
                    >
                        <h3 className="mb-4 text-base font-semibold text-slate-900">Quick actions</h3>
                        <div className="space-y-3">
                            {quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        className="flex items-center justify-between w-full p-4 text-left transition-colors border rounded-lg group border-slate-200 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.accent}`}>
                                                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{action.title}</p>
                                                <p className="text-xs text-slate-500">{action.description}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500" aria-hidden="true" />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                        className="p-6 bg-white border shadow-sm rounded-xl border-slate-200"
                    >
                        <h3 className="mb-4 text-base font-semibold text-slate-900">Engagement</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                        <FireFilled className="text-orange-500" aria-hidden="true" />
                                        Current streak
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">5 days</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '60%' }} />
                                </div>
                            </div>
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm text-slate-700">
                                        <TrophyFilled className="text-amber-500" aria-hidden="true" />
                                        Best streak
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">12 days</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div className="h-full rounded-full bg-amber-500" style={{ width: '90%' }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Achievement banner */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
                className="flex flex-col items-start gap-4 p-6 border border-indigo-100 rounded-xl bg-indigo-50 sm:flex-row sm:items-center"
            >
                <div className="flex items-center justify-center text-lg text-white bg-indigo-600 rounded-lg h-11 w-11 shrink-0">
                    {stats.attendancePercentage >= 75 ? '🏆' : '🚀'}
                </div>
                <div>
                    <h2 className="text-base font-semibold text-slate-900">
                        {stats.attendancePercentage >= 75
                            ? `Outstanding — ${stats.attendancePercentage}% attendance`
                            : `You're at ${stats.attendancePercentage}% — aim for ${Math.ceil(stats.attendancePercentage / 10) * 10 + 10}%`}
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-600">
                        {stats.attendancePercentage >= 75
                            ? 'Keep this momentum going for academic excellence.'
                            : 'Every class attended brings you closer to your goal.'}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentHomePage;