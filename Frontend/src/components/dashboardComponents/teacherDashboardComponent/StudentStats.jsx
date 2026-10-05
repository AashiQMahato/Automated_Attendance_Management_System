import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Spin, message } from 'antd';
import { Users, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from "../../../config/env";

const StudentStats = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    attendanceBySubject: [],
    totalSubjects: 0
  });
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    try {
      const studentsRes = await axios.get(`${API_BASE_URL}/users/students`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const totalStudents = studentsRes.data.data.length;
      const subjectsRes = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const subjects = subjectsRes.data.data;
      const totalSubjects = subjects.length;
      const attendanceBySubject = [];
      let totalAttendanceRate = 0;
  
      for (const subject of subjects) {
        try {
          const attendanceRes = await axios.get(
            `${API_BASE_URL}/attendance/subject/${subject._id}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            }
          );
          const attendanceRecords = attendanceRes.data.data || attendanceRes.data;
  
          // Calculate per-student attendance within the subject
          const studentPresence = {};
          attendanceRecords.forEach(record => {
            record.students.forEach(student => {
              if (!studentPresence[student.student]) {
                studentPresence[student.student] = { present: 0, total: 0 };
              }
              studentPresence[student.student].total += 1;
              if (student.status === 'present') {
                studentPresence[student.student].present += 1;
              }
            });
          });
  
          // Compute average attendance rate for this subject
          const rates = Object.values(studentPresence).map(
            s => (s.present / s.total) * 100
          );
          const averageRate =
            rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
          totalAttendanceRate += averageRate;
  
          attendanceBySubject.push({
            subjectName: subject.name,
            subjectCode: subject.code,
            attendanceRate: averageRate,
            totalClasses: attendanceRecords.length
          });
        } catch (error) {
          console.error(
            `Error fetching attendance for ${subject.name}:`,
            error.response?.status,
            error.response?.data
          );
        }
      }
  
      // Calculate overall average attendance across subjects
      const averageAttendance = totalSubjects > 0 ? totalAttendanceRate / totalSubjects : 0;
  
      setStats({
        totalStudents,
        averageAttendance,
        attendanceBySubject,
        totalSubjects
      });
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error.response?.status, error.response?.data);
      message.error("Failed to fetch data");
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const subjectColumns = [
    { 
      title: 'Subject', 
      dataIndex: 'subjectName', 
      key: 'subjectName',
      render: (text) => (
        <span className="text-xs font-medium sm:text-sm md:text-base">{text}</span>
      )
    },
    { 
      title: 'Code', 
      dataIndex: 'subjectCode', 
      key: 'subjectCode',
      render: (text) => (
        <span className="text-xs sm:text-sm md:text-base">{text}</span>
      ),
      responsive: ['sm']
    },
    {
      title: 'Attendance Rate',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      render: rate => (
        <div className="w-[100px] sm:w-[150px] md:w-[200px]">
          <Progress 
            percent={Number(rate.toFixed(2))} 
            size="small" 
            status={rate < 75 ? 'exception' : 'success'}
            className="text-xs sm:text-sm md:text-base"
          />
        </div>
      )
    },
    { 
      title: 'Total Classes', 
      dataIndex: 'totalClasses', 
      key: 'totalClasses',
      render: (text) => (
        <span className="text-xs sm:text-sm md:text-base">{text}</span>
      ),
      responsive: ['md']
    }
  ];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[300px]">
      <Spin size="large" />
    </div>
  );

  return (
    <div className="p-2 space-y-4 sm:space-y-6 sm:p-4 md:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg sm:p-5 md:p-6 bg-gradient-to-br from-blue-600 to-indigo-700 sm:rounded-xl md:rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-100 sm:text-sm md:text-base">
                Total Students
              </p>
              <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-2xl md:text-3xl">
                {stats.totalStudents}
              </p>
            </div>
            <div className="p-2 rounded-lg sm:p-3 bg-white/10 sm:rounded-xl">
              <Users className="w-6 h-6 text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg sm:p-5 md:p-6 bg-gradient-to-br from-green-600 to-emerald-700 sm:rounded-xl md:rounded-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-100 sm:text-sm md:text-base">
                Avg Attendance
              </p>
              <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-2xl md:text-3xl">
                {stats.averageAttendance.toFixed(2)}%
              </p>
            </div>
            <div className="p-2 rounded-lg sm:p-3 bg-white/10 sm:rounded-xl">
              <LineChart className="w-6 h-6 text-white sm:w-7 sm:h-7 md:w-8 md:h-8" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="p-3 bg-white rounded-lg shadow-sm sm:p-4 md:p-6 sm:rounded-xl md:rounded-2xl">
        <h4 className="mb-2 text-base font-semibold text-gray-800 sm:mb-3 md:mb-4 sm:text-lg md:text-xl">
          Subject Performance
        </h4>
        <div className="-mx-3 overflow-x-auto sm:-mx-4">
          <Table
            columns={subjectColumns}
            dataSource={stats.attendanceBySubject}
            rowKey="subjectCode"
            pagination={false}
            rowClassName="hover:bg-gray-50 transition-colors"
            className="min-w-full"
            scroll={{ x: 'max-content' }}
            size={window.innerWidth < 640 ? 'small' : 'middle'}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentStats;