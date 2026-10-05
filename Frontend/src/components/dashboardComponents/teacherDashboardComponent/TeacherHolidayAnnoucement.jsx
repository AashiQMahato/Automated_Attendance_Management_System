import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, message } from 'antd';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import axios from 'axios';
import { FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { API_BASE_URL } from "../../../config/env";

const TeacherHolidayAnnouncement = () => {
  const [form] = Form.useForm();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
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

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString()
      };

      if (editId) {
        await axios.put(`${API_BASE_URL}/holidays/${editId}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        message.success('Holiday updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/holidays`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        message.success('Holiday announced successfully!');
      }
      
      setEditId(null);
      form.resetFields();
      fetchHolidays();
    } catch (error) {
      message.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/holidays/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      message.success('Holiday deleted successfully!');
      fetchHolidays();
    } catch (error) {
      message.error(error.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
    >
      <div className="mx-auto space-y-8 max-w-7xl">
        {/* Announcement Form */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="p-8 border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10"
        >
          <h2 className="mb-6 text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-300 bg-clip-text">
            {editId ? 'Edit Holiday' : '🎉 Announce New Holiday'}
          </h2>
          
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="title" rules={[{ required: true }]}>
              <Input 
                placeholder="Enter holiday name" 
                className="h-12 text-orange-400 rounded-xl bg-white/5 border-white/10 placeholder:text-blue-600/60" 
              />
            </Form.Item>

            <Form.Item name="dates" rules={[{ required: true }]}>
              <DatePicker.RangePicker
                className="w-full h-12 rounded-xl bg-white/5 border-white/10 [&>.ant-picker-input>input]:text-blue-700"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                suffixIcon={<span className="text-blue-600">📅</span>}
              />
            </Form.Item>

            <Form.Item name="description" rules={[{ required: true }]}>
              <Input.TextArea
                rows={4}
                placeholder="Add holiday details..."
                className="text-blue-200 rounded-xl bg-white/5 border-white/10 placeholder:text-blue-600/60"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-12 text-lg font-semibold transition-all rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-glow"
            >
              {editId ? 'Update Holiday' : 'Publish Announcement'}
            </Button>
          </Form>
        </motion.div>

        {/* Holidays List */}
        <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
>
  {holidays.map((holiday) => (
    <motion.div
      key={holiday._id}
      whileHover={{ y: -4 }}
      className="relative p-6 transition-all border shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl border-white/10 group hover:border-white/20"
    >
      {/* Action Buttons */}
      <div className="absolute flex gap-2 transition-opacity opacity-0 top-5 right-5 group-hover:opacity-100">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setEditId(holiday._id);
            form.setFieldsValue({
              title: holiday.title,
              description: holiday.description,
              dates: [dayjs(holiday.startDate), dayjs(holiday.endDate)]
            });
          }}
          className="p-2 text-blue-400 transition-all rounded-lg bg-white/5 hover:bg-white/10 hover:text-purple-400 backdrop-blur-sm"
        >
          <FaEdit size={16} />
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(holiday._id);
          }}
          className="p-2 text-red-400 transition-all rounded-lg bg-white/5 hover:bg-white/10 hover:text-red-500 backdrop-blur-sm"
        >
          <FaTrash size={16} />
        </button>
      </div>

      {/* Card Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-transparent bg-gradient-to-r from-blue-300 to-purple-200 bg-clip-text">
            {holiday.title}
          </h3>
          <span className="px-3 py-1 text-sm text-blue-300 align-bottom shrink-0 bg-white/5 backdrop-blur-sm">
            {dayjs(holiday.endDate).diff(holiday.startDate, 'day') + 1} days
          </span>
        </div>

        {/* Description */}
        <p className="text-blue-300/80 line-clamp-3">{holiday.description}</p>

        {/* Date Range */}
        <div className="pt-4 mt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm text-blue-400">
            <div className="flex items-center gap-2">
              <span className="text-purple-300">📅</span>
              {dayjs(holiday.startDate).format('MMM D')}
            </div>
            <span className="mx-2 text-purple-300">➔</span>
            <div className="flex items-center gap-2">
              <span className="text-purple-300">📅</span>
              {dayjs(holiday.endDate).format('MMM D')}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ))}
</motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherHolidayAnnouncement;