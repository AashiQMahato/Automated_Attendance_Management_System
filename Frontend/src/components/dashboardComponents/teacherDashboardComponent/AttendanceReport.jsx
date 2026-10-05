import { useState, useEffect } from 'react';
import { Typography, Select, Spin, Alert } from 'antd';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area, AreaChart
} from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Calendar, TrendingUp, AlertCircle, ChevronDown, PieChartIcon, 
  BarChart2, LineChart as LucideLineChart, Target, Award, BookOpen,
  Activity, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from "../../../config/env";

const { Title, Text } = Typography;
const { Option } = Select;

// Enhanced color palette for charts and UI elements
const chartColors = {
  primary: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
  secondary: ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'],
  accent: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
  gradient: {
    bar: 'url(#barGradient)',
    line: 'url(#lineGradient)',
    area: 'url(#areaGradient)',
    card1: 'from-indigo-500 to-purple-600',
    card2: 'from-emerald-500 to-teal-600',
    card3: 'from-amber-500 to-orange-600',
    card4: 'from-red-500 to-rose-600',
    background: 'bg-gradient-to-br from-slate-800 via-indigo-900 to-slate-900'
  }
};

const AttendanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [overallStats, setOverallStats] = useState({
    totalDays: 0,
    avgAttendance: 0,
    highestAttendance: 0,
    lowestAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0,
    attendanceTrend: 'stable', // 'up', 'down', or 'stable'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch data from the server
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const subjectsRes = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      const subjectsArray = subjectsRes.data.data;
      setSubjects(subjectsArray);

      if (subjectsArray.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectsArray[0]._id);
      }

      if (selectedSubject) {
        const attendanceRes = await axios.get(
          `${API_BASE_URL}/attendance/subject/${selectedSubject}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
          }
        );
        const attendanceRecords = attendanceRes.data.data;

        if (!Array.isArray(attendanceRecords)) {
          throw new Error("Attendance records is not an array");
        }

        const processedData = attendanceRecords.map((record) => ({
          date: new Date(record.date).toLocaleDateString(),
          presentCount: record.students.filter((s) => s.status === 'present').length,
          absentCount: record.students.filter((s) => s.status !== 'present').length,
          totalStudents: record.students.length,
          attendanceRate: Math.round((record.students.filter((s) => s.status === 'present').length / record.students.length) * 100)
        }));

        const totalPresent = attendanceRecords.reduce(
          (sum, record) => sum + record.students.filter((s) => s.status === 'present').length,
          0
        );
        const totalStudents = attendanceRecords.reduce(
          (sum, record) => sum + record.students.length,
          0
        );
        const presentCounts = processedData.map((d) => d.presentCount);

        // Calculate attendance trend
        let trend = 'stable';
        if (processedData.length >= 2) {
          const firstHalf = processedData.slice(0, Math.floor(processedData.length / 2));
          const secondHalf = processedData.slice(Math.floor(processedData.length / 2));
          
          const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.presentCount, 0) / firstHalf.length;
          const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.presentCount, 0) / secondHalf.length;
          
          if (secondHalfAvg > firstHalfAvg * 1.05) trend = 'up';
          else if (secondHalfAvg < firstHalfAvg * 0.95) trend = 'down';
        }

        setAttendanceData(processedData);
        setOverallStats({
          totalDays: processedData.length,
          avgAttendance: processedData.length ? (totalPresent / totalStudents * 100).toFixed(1) : 0,
          highestAttendance: presentCounts.length ? Math.max(...presentCounts) : 0,
          lowestAttendance: presentCounts.length ? Math.min(...presentCounts) : 0,
          totalPresent,
          totalAbsent: totalStudents - totalPresent,
          attendanceTrend: trend
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch attendance data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSubject, refreshTrigger]);

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    setLoading(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Prepare chart data
  const getChartData = () => {
    return {
      barData: attendanceData,
      pieData: [
        { name: 'Present', value: overallStats.totalPresent },
        { name: 'Absent', value: overallStats.totalAbsent }
      ],
      lineData: attendanceData.map((d, i) => ({
        name: `Day ${i + 1}`,
        attendance: d.presentCount,
        attendanceRate: d.attendanceRate
      })),
    };
  };

  const { barData, pieData, lineData } = getChartData();

  // Custom label for pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getSelectedSubjectName = () => {
    const subject = subjects.find(s => s._id === selectedSubject);
    return subject ? subject.name : 'Loading...';
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <ArrowUpRight className="w-5 h-5 text-emerald-400" />;
      case 'down': return <ArrowDownRight className="w-5 h-5 text-rose-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className={`min-h-screen p-4 md:p-6 lg:p-8 ${chartColors.gradient.background}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
          <motion.div
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Title level={2} className="text-gray-100 !m-0 flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="w-8 h-8 text-indigo-300" />
              </motion.div>
              Attendance Analytics Dashboard
            </Title>
            <Text className="flex items-center gap-2 mt-2 text-indigo-200">
              <BookOpen className="w-4 h-4" />
              Currently viewing: <span className="font-semibold text-white">{getSelectedSubjectName()}</span>
            </Text>
          </motion.div>

          <div className="flex items-center w-full gap-4 md:w-auto">
            <Select
              suffixIcon={<ChevronDown className="text-indigo-300" />}
              className="min-w-[200px] w-full md:w-auto bg-white/5 border border-indigo-500/30 rounded-xl"
              value={selectedSubject}
              onChange={handleSubjectChange}
              popupClassName="bg-slate-800 text-indigo-100 rounded-lg"
              dropdownStyle={{ background: '#1e293b', borderRadius: '0.75rem' }}
            >
              {subjects.map(subject => (
                <Option key={subject._id} value={subject._id} className="hover:bg-indigo-900/50">
                  {subject.name}
                </Option>
              ))}
            </Select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 text-indigo-200 transition-all border rounded-full bg-indigo-600/30 border-indigo-500/30 hover:bg-indigo-600/50"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center border h-96 bg-white/5 backdrop-blur-sm rounded-3xl border-white/10"
            >
              <Spin size="large" />
              <Text className="mt-4 text-indigo-200">Loading attendance data...</Text>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Alert 
                message={error} 
                type="error" 
                className="mb-4 border shadow-lg rounded-xl border-red-500/30" 
                showIcon
              />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { 
                    icon: Calendar, 
                    title: 'Total Days', 
                    value: overallStats.totalDays, 
                    gradient: chartColors.gradient.card1,
                    description: "Days recorded"
                  },
                  { 
                    icon: TrendingUp, 
                    title: 'Avg Attendance', 
                    value: `${overallStats.avgAttendance}%`, 
                    gradient: chartColors.gradient.card2,
                    description: "Average attendance rate",
                    suffix: getTrendIcon(overallStats.attendanceTrend)
                  },
                  { 
                    icon: Target, 
                    title: 'Highest Attendance', 
                    value: overallStats.highestAttendance, 
                    gradient: chartColors.gradient.card3,
                    description: "Best attendance day"
                  },
                  { 
                    icon: AlertCircle, 
                    title: 'Lowest Attendance', 
                    value: overallStats.lowestAttendance, 
                    gradient: chartColors.gradient.card4,
                    description: "Lowest attendance day"
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.title}
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 25px 50px -12px rgba(79, 70, 229, 0.25)" 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`p-6 border shadow-2xl bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-3xl border-white/10 relative overflow-hidden`}
                  >
                    {/* Background decorative elements */}
                    <div className="absolute z-0 w-32 h-32 rounded-full -right-10 -top-10 bg-white/10 blur-2xl"></div>
                    <div className="absolute z-0 w-24 h-24 rounded-full -left-10 -bottom-10 bg-white/5 blur-xl"></div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="p-3 shadow-inner rounded-xl bg-white/20 backdrop-blur-sm">
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <Text className="text-sm text-gray-100 opacity-90">{stat.title}</Text>
                        <div className="flex items-center gap-2">
                          <Title level={3} className="!mt-1 !mb-0 text-white">
                            {stat.value}
                          </Title>
                          {stat.suffix && stat.suffix}
                        </div>
                        <Text className="mt-1 text-xs text-white/70">{stat.description}</Text>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                {/* Daily Attendance Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative p-6 overflow-hidden border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-indigo-500/20"
                >
                  <div className="absolute z-0 w-56 h-56 rounded-full -right-20 -top-20 bg-indigo-500/10 blur-3xl"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-6 h-6 text-indigo-300" />
                      <Text strong className="text-lg text-gray-200">Daily Attendance Trend</Text>
                    </div>
                    <Award className="w-5 h-5 text-amber-300" />
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <Bar dataKey="presentCount" fill={chartColors.gradient.bar} radius={[8, 8, 0, 0]} />
                      <XAxis dataKey="date" stroke="#e5e7eb" axisLine={false} tickLine={false} />
                      <YAxis stroke="#e5e7eb" axisLine={false} tickLine={false} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          color: '#fff' 
                        }} 
                        formatter={(value) => [`${value} students`, 'Present']}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Attendance Distribution Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative p-6 overflow-hidden border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-emerald-500/20"
                >
                  <div className="absolute z-0 w-56 h-56 rounded-full -left-20 -top-20 bg-emerald-500/10 blur-3xl"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <PieChartIcon className="w-6 h-6 text-emerald-300" />
                      <Text strong className="text-lg text-gray-200">Attendance Distribution</Text>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 text-xs border rounded-full bg-emerald-900/30 border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span className="text-emerald-300">Present vs Absent</span>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <defs>
                        <linearGradient id="pieGradient1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={1} />
                        </linearGradient>
                        <linearGradient id="pieGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={60}
                        dataKey="value"
                        paddingAngle={5}
                      >
                        <Cell fill="url(#pieGradient1)" stroke="#10b981" strokeWidth={2} />
                        <Cell fill="url(#pieGradient2)" stroke="#ef4444" strokeWidth={2} />
                      </Pie>
                      <Legend 
                        verticalAlign="bottom" 
                        iconType="circle" 
                        wrapperStyle={{ color: '#e5e7eb', fontSize: '14px' }} 
                        formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value}</span>}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          color: '#fff' 
                        }}
                        formatter={(value) => [`${value} students`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Attendance Rate Area Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative p-6 overflow-hidden border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-purple-500/20 lg:col-span-2"
                >
                  <div className="absolute z-0 w-56 h-56 rounded-full -right-20 -bottom-20 bg-purple-500/10 blur-3xl"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <LucideLineChart className="w-6 h-6 text-purple-300" />
                      <Text strong className="text-lg text-gray-200">Attendance Rate Progression</Text>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 text-xs border rounded-full bg-purple-900/30 border-purple-500/20">
                      <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                      <span className="text-purple-300">% of students present</span>
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.7} />
                          <stop offset="90%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#c4b5fd" stopOpacity={1} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <Area 
                        type="monotone" 
                        dataKey="attendanceRate" 
                        fill="url(#areaGradient)" 
                        stroke="url(#lineGradient)" 
                        strokeWidth={3} 
                      />
                      <XAxis 
                        dataKey="name" 
                        stroke="#d1d5db" 
                        axisLine={false} 
                        tickLine={false}
                        padding={{ left: 20, right: 20 }}
                      />
                      <YAxis 
                        stroke="#d1d5db" 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                        domain={[0, 100]}
                        padding={{ top: 20, bottom: 20 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          color: '#fff' 
                        }}
                        formatter={(value) => [`${value}%`, 'Attendance Rate']}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>
              
              {/* Footer Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-4 text-sm text-center text-indigo-200/70"
              >
                <p>Data updated for {getSelectedSubjectName()} • {attendanceData.length} days analyzed</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AttendanceReport;