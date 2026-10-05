import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Tag, Grid } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Column } from '@ant-design/plots';
import store from '../../../zustand/loginStore';
import { API_BASE_URL } from "../../../config/env";

const { useBreakpoint } = Grid;

const StudentAttendance = () => {
  const screens = useBreakpoint();
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const { loginUserData } = store(state => state);

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  useEffect(() => {
    if (attendanceData.length > 0) {
      const stats = Object.entries(
        attendanceData.reduce((acc, curr) => {
          if (!acc[curr.subject]) {
            acc[curr.subject] = { present: 0, absent: 0, total: 0 };
          }
          acc[curr.subject][curr.status]++;
          acc[curr.subject].total++;
          return acc;
        }, {})
      ).flatMap(([subject, data]) => ([
        {
          subject,
          status: 'Present',
          count: data.present,
          percentage: Math.round((data.present / data.total) * 100)
        },
        {
          subject,
          status: 'Absent',
          count: data.absent,
          percentage: Math.round((data.absent / data.total) * 100)
        }
      ]));

      setSubjectStats(stats);
    }
  }, [attendanceData]);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const { data } = await api.get('/attendance/student');
      const transformedData = data.flatMap(record =>
        record.students
          .filter(student => student.student === loginUserData._id)
          .map(student => ({
            key: student._id,
            date: record.date,
            subject: record.subject.name,
            status: student.status,
            timestamp: student.timestamp
          }))
      );
      setAttendanceData(transformedData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const barConfig = {
    data: subjectStats,
    xField: 'subject',
    yField: 'count',
    seriesField: 'status',
    isGroup: true,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    color: ['#10b981', '#f43f5e'],
    label: {
      position: 'top',
      style: {
        fill: '#334155',
        fontSize: screens.xs ? 10 : 12,
        opacity: 0.8,
      },
    },
    legend: {
      position: screens.xs ? 'bottom' : 'top-right',
      itemHeight: screens.xs ? 8 : 12,
    },
    xAxis: {
      label: {
        autoRotate: true,
        style: {
          fontSize: screens.xs ? 10 : 12,
          fill: '#64748b',
        },
      },
      line: { style: { stroke: '#e2e8f0' } },
    },
    yAxis: {
      label: {
        style: {
          fontSize: screens.xs ? 10 : 12,
          fill: '#64748b',
        },
      },
      grid: { line: { style: { stroke: '#f1f5f9' } } },
    },
    tooltip: {
      customContent: (title, items) => {
        const tooltipData = items.map(item => ({
          color: item.color,
          name: item.name,
          value: item.value,
          percentage: subjectStats.find(
            (stat) => stat.subject === title && stat.status === item.name
          )?.percentage || 0
        }));

        return (
          <div style={{ padding: '10px 12px' }}>
            <div style={{ marginBottom: '6px', fontWeight: 600, color: '#0f172a' }}>{title}</div>
            {tooltipData.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    marginRight: '8px',
                  }}
                />
                <span style={{ color: '#334155' }}>{`${item.name}: ${item.value} (${item.percentage}%)`}</span>
              </div>
            ))}
          </div>
        );
      },
    },
  };

  const columns = [
    {
      title: <span className="inline-flex items-center gap-1.5"><CalendarOutlined /> Date</span>,
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span className="text-xs text-slate-600 md:text-sm">
          {dayjs(date).format(screens.xs ? 'DD/MM/YY' : 'DD MMM YYYY')}
        </span>
      ),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      responsive: ['sm'],
    },
    {
      title: <span className="inline-flex items-center gap-1.5"><BookOutlined /> Subject</span>,
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => (
        <span className="text-xs font-medium text-slate-800 md:text-sm">{subject}</span>
      ),
      filters: [
        { text: 'Mathematics', value: 'Mathematics' },
        { text: 'Physics', value: 'Physics' },
      ],
      onFilter: (value, record) => record.subject.includes(value),
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          icon={status === 'present' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          color={status === 'present' ? 'success' : 'error'}
          className="text-xs font-medium md:text-sm"
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Updated',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <span className="text-xs text-slate-500 md:text-sm">
          {dayjs(timestamp).format(screens.xs ? 'DD/MM HH:mm' : 'DD MMM YYYY HH:mm')}
        </span>
      ),
      responsive: ['lg'],
    },
  ];

  const total = attendanceData.length;
  const presentCount = attendanceData.filter(a => a.status === 'present').length;
  const absentCount = attendanceData.filter(a => a.status === 'absent').length;
  const percentage = total ? Math.round((presentCount / total) * 100) : 0;

  const quickStats = [
    { label: 'Total Days', value: total, accent: 'text-slate-900' },
    { label: 'Present', value: presentCount, accent: 'text-emerald-600' },
    { label: 'Absent', value: absentCount, accent: 'text-rose-600' },
    { label: 'Rate', value: `${percentage}%`, accent: 'text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="p-4 bg-white border shadow-sm rounded-xl border-slate-200">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${stat.accent}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChartOutlined className="text-indigo-600" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-slate-900 md:text-base">Subject-wise attendance</h3>
        </div>
        <Column {...barConfig} height={screens.xs ? 220 : screens.md ? 300 : 260} />
      </div>

      {/* Table */}
      <div className="p-2 bg-white border shadow-sm rounded-xl border-slate-200 md:p-4">
        <Table
          dataSource={attendanceData}
          columns={columns}
          pagination={{
            pageSize: screens.xs ? 5 : 10,
            showSizeChanger: false,
            size: screens.xs ? 'small' : 'default',
          }}
          bordered={false}
          scroll={{ x: 'max-content' }}
          size={screens.xs ? 'small' : 'middle'}
          title={() => (
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-slate-700 md:text-base">
              <CheckCircleOutlined className="text-emerald-600" />
              Records: {attendanceData.length}
            </div>
          )}
          locale={{ emptyText: 'No attendance records yet' }}
        />
      </div>
    </div>
  );
};

export default StudentAttendance;