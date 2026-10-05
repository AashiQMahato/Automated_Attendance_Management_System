import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import axios from 'axios';
import { message } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { API_BASE_URL } from "../../../config/env";

const statusStyles = {
  upcoming: 'bg-amber-50 text-amber-700 border-amber-100',
  ongoing: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  passed: 'bg-slate-100 text-slate-500 border-slate-200',
};

const Holiday = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/holidays`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      setHolidays(data.data);
    } catch (error) {
      message.error(error.response?.data?.error || 'Failed to fetch holidays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const getHolidayStatus = (startDate, endDate) => {
    const today = dayjs();
    if (today.isBefore(startDate)) return 'upcoming';
    if (today.isAfter(endDate)) return 'passed';
    return 'ongoing';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Holidays</h2>
        <p className="mt-0.5 text-sm text-slate-500">Academic calendar breaks and observances</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-5 bg-white border rounded-xl border-slate-200">
              <div className="w-2/3 h-5 mb-4 rounded animate-pulse bg-slate-100" />
              <div className="w-full h-3 mb-2 rounded animate-pulse bg-slate-100" />
              <div className="w-3/4 h-3 mb-4 rounded animate-pulse bg-slate-100" />
              <div className="w-1/2 h-3 rounded animate-pulse bg-slate-100" />
            </div>
          ))}
        </div>
      ) : holidays.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed rounded-xl border-slate-200">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-100">
            <CalendarOutlined className="text-xl text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No holidays scheduled</p>
          <p className="mt-1 text-sm text-slate-400">Check back later for updates to the academic calendar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {holidays.map((holiday, index) => {
            const status = getHolidayStatus(dayjs(holiday.startDate), dayjs(holiday.endDate));

            return (
              <motion.div
                key={holiday._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="p-5 transition-shadow bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-base font-semibold text-slate-900">{holiday.title}</h3>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <p className="mb-4 text-sm text-slate-500 line-clamp-2">{holiday.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarOutlined aria-hidden="true" />
                  <span>
                    {dayjs(holiday.startDate).format('MMM D')} – {dayjs(holiday.endDate).format('MMM D, YYYY')}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Holiday;