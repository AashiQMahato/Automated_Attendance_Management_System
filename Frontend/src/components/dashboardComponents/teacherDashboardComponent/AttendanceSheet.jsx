import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  Tag, 
  DatePicker, 
  Select, 
  Button, 
  message,
  Skeleton,
  Tooltip
} from 'antd';
import moment from 'moment';
import { ReactTyped } from 'react-typed';
import { 
  CalendarOutlined, 
  BookOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EditOutlined,
  TeamOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import store from '../../../zustand/loginStore';
import useAttendanceStore from '../../../zustand/attendanceStore.js';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from "../../../config/env";

// Letter Avatar component for 3D letter display
const LetterAvatar = ({ name }) => {
  // Extract first letter and ensure it's uppercase
  const firstLetter = name && name.length > 0 ? name.charAt(0).toUpperCase() : 'S';
  
  // Generate a consistent gradient color based on the letter
  const getGradientColors = (letter) => {
    const colorPairs = [
      ['from-blue-500 to-indigo-600', 'text-white'],
      ['from-purple-500 to-pink-600', 'text-white'],
      ['from-cyan-500 to-blue-600', 'text-white'],
      ['from-emerald-500 to-teal-600', 'text-white'],
      ['from-amber-500 to-orange-600', 'text-white'],
      ['from-rose-500 to-red-600', 'text-white'],
      ['from-indigo-500 to-violet-600', 'text-white'],
    ];
    
    // Use char code to select a consistent color
    const index = letter.charCodeAt(0) % colorPairs.length;
    return colorPairs[index];
  };
  
  const [gradientColor, textColor] = getGradientColors(firstLetter);

  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`relative flex items-center justify-center w-10 h-10 overflow-hidden rounded-xl bg-gradient-to-br ${gradientColor} shadow-lg`}
      style={{ 
        boxShadow: '0 4px 10px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.3)', 
      }}
    >
      {/* 3D effect achieved with multiple layered shadows */}
      <span 
        className={`${textColor} text-xl font-bold`}
        style={{ 
          textShadow: '1px 1px 2px rgba(0,0,0,0.3), -1px -1px 1px rgba(255,255,255,0.2)',
          transform: 'translateZ(5px)',
        }}
      >
        {firstLetter}
      </span>
      {/* Inner highlight for 3D effect */}
      <div className="absolute top-0 left-0 w-full bg-white h-1/3 opacity-20 rounded-t-xl"></div>
    </motion.div>
  );
};

const AttendanceSheet = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(moment());
  const [attendanceData, setAttendanceData] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { attendanceRecords, addAttendanceRecord } = useAttendanceStore();
  
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // Add request interceptor to include token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/subjects');
        if (response.data?.data) {
          setSubjects(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
        message.error('Failed to load subjects');
      }
    };
    fetchSubjects();
  }, []);

  // Load students when subject changes
  useEffect(() => {
    if (selectedSubject) {
      loadStudents();
    }
  }, [selectedSubject, attendanceRecords]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/students');
      
      // Find the latest record for this subject
      const latestRecord = attendanceRecords
        .filter(record => 
          record && 
          record.subjects && 
          Array.isArray(record.subjects) && 
          record.subjects.some(subject => subject && subject._id === selectedSubject)
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      const studentsWithAttendance = response.data.data.map(student => ({
        id: student._id,
        name: student.fullName,
        semester: student.semester,
        present: false,
        confidence: 0
      }));
      
      // Update with recognition data if available
      if (latestRecord && Array.isArray(latestRecord.students)) {
        studentsWithAttendance.forEach(student => {
          const recognizedStudent = latestRecord.students.find(
            rs => rs && rs.name && student.name && 
                 rs.name.toLowerCase().trim() === student.name.toLowerCase().trim()
          );
          if (recognizedStudent) {
            student.present = recognizedStudent.confidence >= 0.70;
            student.confidence = recognizedStudent.confidence;
          }
        });
        setRecognizedStudents(latestRecord.students);
      } else {
        setRecognizedStudents([]);
      }

      setAttendanceData(studentsWithAttendance);
      message.success(`Loaded ${studentsWithAttendance.length} students`);
    } catch (error) {
      console.error('Failed to load students:', error);
      message.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async () => {
    try {
      if (!selectedSubject || !attendanceDate || !attendanceData?.length) {
        message.error('Please ensure all required fields are filled');
        return;
      }

      const attendancePayload = {
        subjectId: selectedSubject,
        date: attendanceDate.toDate(),
        students: attendanceData.map(student => ({
          student: student.id,
          status: student.present ? 'present' : 'absent',
          confidence: student.confidence || null
        }))
      };

      // Get current subject details
      const currentSubject = subjects.find(subject => subject._id === selectedSubject);
      
      // Submit attendance
      const response = await api.post('/attendance/markattendance', attendancePayload);

      if (response.data) {
        const recognitionResults = attendanceData.map(student => ({
          name: student.name,
          confidence: student.confidence
        }));

        // Add to store with current subject
        addAttendanceRecord(recognitionResults, currentSubject, null);
        message.success('Attendance marked successfully!');
        
        // Optionally refresh the student list
        await loadStudents();
      }
    } catch (error) {
      console.error('Attendance submission error:', error);
      if (error.response?.data?.message) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('Failed to mark attendance. Please try again.');
      }
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      responsive: ['md'],
      render: (name, record) => {
        const recognizedStudent = recognizedStudents.find(
          rs => rs && rs.name && rs.name.toLowerCase().trim() === name.toLowerCase().trim()
        );
        return (
          <motion.div 
            initial={{ opacity: 0.8 }}
            whileHover={{ opacity: 1, scale: 1.02 }}
            className="flex items-center gap-3"
          >
            {/* Replace UserOutlined with 3D Letter Avatar */}
            <LetterAvatar name={name} />
            <span className="font-medium text-white">{name}</span>
            {recognizedStudent && (
              <Tooltip title="AI Recognition Confidence">
                <Tag color={record.confidence > 0.9 ? "cyan" : "blue"} className="hidden ml-2 md:inline">
                  {(record.confidence * 100).toFixed(0)}%
                </Tag>
              </Tooltip>
            )}
          </motion.div>
        );
      }
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      responsive: ['md'],
      render: (semester) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
            <BookOutlined className="text-white" />
          </div>
          <span className="font-medium text-white">{semester}</span>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'present',
      key: 'status',
      render: (present, record) => (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Tag 
            icon={present ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={present ? 'success' : 'error'} 
            className="px-3 py-1 font-medium border-0 shadow-md"
          >
            {present ? 'Present' : 'Absent'}
          </Tag>
        </motion.div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={() => {
              setAttendanceData(prev => 
                prev.map(student => 
                  student.id === record.id 
                    ? { ...student, present: !student.present } 
                    : student
                )
              );
            }}
            type="primary"
            icon={<EditOutlined />}
            className="flex items-center gap-1 border-0 shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600"
          >
            Toggle
          </Button>
        </motion.div>
      )
    }
  ];

  // Mobile-specific columns
  const mobileColumns = [
    {
      title: 'Student',
      key: 'student',
      render: (record) => (
        <div className="flex items-center gap-2">
          {/* 3D Letter Avatar for mobile view */}
          <LetterAvatar name={record.name} />
          <div className="flex flex-col">
            <div className="font-semibold text-white">{record.name}</div>
            <div className="text-xs text-blue-300">Semester {record.semester}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'present',
      key: 'status',
      render: (present) => (
        <Tag 
          icon={present ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={present ? 'success' : 'error'} 
          className="px-2 py-1 font-medium border-0"
        >
          {present ? 'P' : 'A'}
        </Tag>
      )
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button 
          onClick={() => {
            setAttendanceData(prev => 
              prev.map(student => 
                student.id === record.id 
                  ? { ...student, present: !student.present } 
                  : student
              )
            );
          }}
          type="primary"
          size="small"
          className="bg-blue-500 border-0 shadow-md"
          icon={<EditOutlined />}
        />
      )
    }
  ];

  // Calculate summary data
  const totalStudents = attendanceData.length;
  const totalPresent = attendanceData.filter(student => student.present).length;
  const totalAbsent = totalStudents - totalPresent;
  const attendancePercentage = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute bg-purple-600 rounded-full top-20 right-10 w-96 h-96 opacity-10 blur-3xl"></div>
        <div className="absolute bg-blue-500 rounded-full bottom-20 left-10 w-80 h-80 opacity-10 blur-3xl"></div>
        <div className="absolute w-64 h-64 rounded-full top-1/3 left-1/4 bg-cyan-400 opacity-10 blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto space-y-8 max-w-7xl"
      >
        {/* Header Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative p-6 overflow-hidden border shadow-2xl md:p-8 border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-start mb-8 md:items-center md:flex-row md:mb-10">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 5,
                  ease: "easeInOut" 
                }}
                className="flex items-center justify-center w-16 h-16 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 md:mb-0 md:mr-6"
              >
                <DashboardOutlined className="text-3xl text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-transparent md:text-4xl bg-gradient-to-r from-blue-300 via-cyan-200 to-purple-200 bg-clip-text">
                  <ReactTyped
                    strings={["Attendance Management"]}
                    typeSpeed={50}
                    showCursor={false}
                  />
                </h1>
                <p className="mt-2 text-blue-200 opacity-90">
                  Track and manage student attendance with ease
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="p-4 space-y-2 border rounded-2xl bg-white/5 border-white/10"
              >
                <label className="flex items-center gap-2 mb-2 font-medium text-blue-200">
                  <BookOutlined className="text-blue-400" />
                  Select Subject
                </label>
                <Select
                  placeholder="Choose a subject..."
                  className="w-full"
                  onChange={value => setSelectedSubject(value)}
                  options={subjects.map(subject => ({
                    value: subject._id,
                    label: isMobile ? subject.name : `${subject.name} (${subject.code})`
                  }))}
                  dropdownStyle={{ 
                    background: '#1e293b',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="p-4 space-y-2 border rounded-2xl bg-white/5 border-white/10"
              >
                <label className="flex items-center gap-2 mb-2 font-medium text-blue-200">
                  <CalendarOutlined className="text-blue-400" />
                  Date
                </label>
                <DatePicker
                  className="w-full"
                  value={attendanceDate}
                  onChange={date => setAttendanceDate(date)}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Attendance Summary Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative overflow-hidden border shadow-lg bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 rounded-full bg-blue-500/10 blur-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <TeamOutlined className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-blue-100">Total Students</h3>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={totalStudents}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-3xl font-semibold text-white"
                    >
                      {loading ? <Skeleton.Button active size="small" /> : totalStudents}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative overflow-hidden border shadow-lg bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 rounded-full bg-green-500/10 blur-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
                  <CheckCircleOutlined className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-green-100">Present</h3>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={totalPresent}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-3xl font-semibold text-white"
                    >
                      {loading ? <Skeleton.Button active size="small" /> : totalPresent}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative overflow-hidden border shadow-lg bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 rounded-full bg-red-500/10 blur-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600">
                  <CloseCircleOutlined className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-100">Absent</h3>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={totalAbsent}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-3xl font-semibold text-white"
                    >
                      {loading ? <Skeleton.Button active size="small" /> : totalAbsent}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -5 }}
            className="relative overflow-hidden border shadow-lg bg-white/5 backdrop-blur-md rounded-3xl border-white/10"
          >
            <div className="absolute top-0 right-0 w-24 h-24 -mt-6 -mr-6 rounded-full bg-purple-500/10 blur-xl"></div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600">
                  <SyncOutlined className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-purple-100">Attendance</h3>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={attendancePercentage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1 text-3xl font-semibold text-white"
                    >
                      {loading ? <Skeleton.Button active size="small" /> : `${attendancePercentage}%`}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Attendance Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="overflow-hidden border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10"
        >
          <div className="p-6">
            <h2 className="flex items-center gap-3 mb-6 text-xl font-semibold text-white">
              <TeamOutlined className="text-blue-400" />
              Student Attendance List
            </h2>
            <Table
              columns={isMobile ? mobileColumns : columns}
              dataSource={attendanceData}
              loading={loading}
              rowKey="id"
              className="attendance-table"
              rowClassName={() => "bg-transparent hover:bg-white/5 transition-all cursor-pointer"}
              pagination={{
                pageSize: 8,
                className: 'custom-pagination text-white',
                showTotal: (total) => `Total ${total} students`,
              }}
            />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button
              onClick={handleAttendanceSubmit}
              disabled={!selectedSubject || attendanceData.length === 0}
              className={`h-auto px-8 py-3 text-lg font-medium border-0 shadow-lg rounded-xl 
                ${!selectedSubject || attendanceData.length === 0 
                  ? 'bg-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              type="primary"
              icon={<CheckCircleOutlined />}
            >
              Submit Attendance
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AttendanceSheet;