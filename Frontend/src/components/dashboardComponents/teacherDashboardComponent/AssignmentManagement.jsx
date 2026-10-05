import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Table, Tag, message, Typography, Upload, Grid, Empty, Spin } from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined, 
  BookOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import dayjs from 'dayjs';
import { API_BASE_URL } from "../../../config/env";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const AssignmentManagement = () => {
  const screens = useBreakpoint();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAssignments();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (editingAssignment) {
      form.setFieldsValue({
        title: editingAssignment.title,
        description: editingAssignment.description,
        subject: editingAssignment.subject._id,
        dueDate: dayjs(editingAssignment.dueDate),
      });
    }
  }, [editingAssignment, form]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/assignments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setAssignments(res.data.data);
    } catch (error) {
      message.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/subjects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSubjects(res.data.data);
    } catch (error) {
      message.error('Failed to fetch subjects');
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('subject', values.subject);
      formData.append('dueDate', values.dueDate.format('YYYY-MM-DD'));
      values.attachments?.fileList?.forEach((file) => {
        formData.append('files', file.originFileObj);
      });

      if (editingAssignment) {
        await axios.put(
          `${API_BASE_URL}/assignments/${editingAssignment._id}`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        message.success('Assignment updated successfully');
      } else {
        await axios.post(
          `${API_BASE_URL}/assignments`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        message.success('Assignment created successfully');
      }

      setIsModalVisible(false);
      setEditingAssignment(null);
      form.resetFields();
      fetchAssignments();
    } catch (error) {
      message.error(editingAssignment ? 'Failed to update assignment' : 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/assignments/${assignmentToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
      message.success('Assignment deleted successfully');
      fetchAssignments();
    } catch (error) {
      message.error('Failed to delete assignment');
    } finally {
      setLoading(false);
      setIsDeleteModalVisible(false);
      setAssignmentToDelete(null);
    }
  };

  const showEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalVisible(true);
  };

  const showDeleteModal = (assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteModalVisible(true);
  };

  const resetModal = () => {
    setEditingAssignment(null);
    form.resetFields();
  };

  const getDueDateStatus = (dueDate) => {
    const today = dayjs();
    const due = dayjs(dueDate);
    const daysRemaining = due.diff(today, 'day');
    
    if (daysRemaining < 0) return { color: 'red', status: 'Overdue' };
    if (daysRemaining <= 2) return { color: 'orange', status: 'Due soon' };
    return { color: 'green', status: 'Upcoming' };
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <motion.div 
          className="flex items-center max-w-[150px] sm:max-w-[200px] md:max-w-[300px]"
          whileHover={{ scale: 1.01 }}
        >
          <FileTextOutlined className="mr-2 text-blue-500" />
          <Text strong className="text-sm sm:text-base line-clamp-2">
            {text}
          </Text>
        </motion.div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      responsive: ['sm'],
      render: (subject) => (
        <motion.div whileHover={{ scale: 1.05 }}>
          <Tag color="blue" className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full sm:text-sm">
            <BookOutlined />
            {subject.name}
          </Tag>
        </motion.div>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        const { color, status } = getDueDateStatus(date);
        return (
          <motion.div 
            className="flex flex-col sm:flex-row sm:items-center sm:gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <span className="flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap">
              <ClockCircleOutlined />
              {dayjs(date).format('YYYY-MM-DD')}
            </span>
            <Tag color={color} className="mt-1 text-xs sm:mt-0 sm:text-sm">
              {status}
            </Tag>
          </motion.div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-1 flex-nowrap sm:gap-2">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)}
              className="px-2 text-xs bg-blue-500 shadow-md hover:bg-blue-600 sm:text-sm sm:px-3"
            >
              {screens.sm ? 'Edit' : ''}
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record)}
              className="px-2 text-xs shadow-md sm:text-sm sm:px-3"
            >
              {screens.sm ? 'Delete' : ''}
            </Button>
          </motion.div>
        </div>
      ),
    },
  ];

  return (
    <motion.div 
      className="min-h-screen p-3 rounded-lg sm:p-4 md:p-6 lg:p-8 sm:rounded-xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Card 
          className="p-3 border-none rounded-md shadow-2xl sm:p-4 md:p-6 sm:rounded-lg backdrop-blur-md bg-white/95"
          style={{ 
            boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 5px 15px -10px rgba(0, 0, 0, 0.5)"
          }}
        >
          <div className="flex flex-col gap-4 mb-6 sm:gap-6 md:mb-8 md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <Title level={3} className="!text-xl sm:!text-2xl md:!text-3xl !mb-0 text-center md:text-left bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                Assignment Management
              </Title>
              <Text className="block mt-1 text-sm text-center text-gray-500 md:text-left md:mt-2">
                Create, manage and track student assignments
              </Text>
            </motion.div>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  resetModal();
                  setIsModalVisible(true);
                }}
                className="self-center px-4 text-sm font-medium border-none rounded-md shadow-lg h-9 md:self-auto sm:text-base sm:px-5 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              >
                Create Assignment
              </Button>
            </motion.div>
          </div>

          <div className="p-2 -mx-3 overflow-x-auto rounded-lg shadow-inner sm:-mx-4 bg-gray-50/70">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Spin size="large" />
                <Text className="mt-4 text-gray-500">Loading assignments...</Text>
              </div>
            ) : assignments.length === 0 ? (
              <Empty 
                description="No assignments found" 
                className="py-8"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table 
                columns={columns} 
                dataSource={assignments} 
                rowKey="_id" 
                loading={loading}
                pagination={{ 
                  pageSize: 6,
                  responsive: true,
                  showSizeChanger: false,
                  className: "px-3 sm:px-4"
                }} 
                className="min-w-full"
                scroll={{ x: 'max-content' }}
                size={screens.sm ? "middle" : "small"}
                rowClassName="hover:bg-blue-50 transition-colors duration-200"
                components={{
                  body: {
                    row: (props) => (
                      <motion.tr
                        {...props}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    ),
                  },
                }}
              />
            )}
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {isModalVisible && (
          <Modal
            title={
              <div className="flex items-center gap-2">
                <span className="inline-block p-2 text-white bg-blue-500 rounded-full">
                  {editingAssignment ? <EditOutlined /> : <PlusOutlined />}
                </span>
                <Text className="text-lg font-semibold sm:text-xl">
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </Text>
              </div>
            }
            open={isModalVisible}
            onCancel={() => {
              setIsModalVisible(false);
              resetModal();
            }}
            footer={null}
            width={screens.sm ? 550 : "95%"}
            className="responsive-modal"
            destroyOnClose
            maskStyle={{ backdropFilter: 'blur(5px)', background: 'rgba(0, 0, 0, 0.45)' }}
            style={{ top: 20 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Form 
                form={form} 
                layout="vertical" 
                onFinish={handleSubmit} 
                className="mt-4 space-y-4 sm:space-y-5"
                requiredMark={false}
              >
                <Form.Item 
                  name="title" 
                  label={<span className="text-sm font-medium sm:text-base">Title</span>} 
                  rules={[{ required: true, message: 'Please enter title' }]}
                >
                  <Input 
                    prefix={<FileTextOutlined className="text-gray-400" />}
                    placeholder="Enter assignment title" 
                    className="py-2 text-sm rounded-md sm:text-base"
                  />
                </Form.Item>

                <Form.Item 
                  name="subject" 
                  label={<span className="text-sm font-medium sm:text-base">Subject</span>} 
                  rules={[{ required: true, message: 'Please select subject' }]}
                >
                  <Select 
                    placeholder="Select subject"
                    className="text-sm sm:text-base"
                    suffixIcon={<BookOutlined className="text-gray-400" />}
                    dropdownClassName="rounded-md shadow-lg"
                  >
                    {subjects.map((subject) => (
                      <Option key={subject._id} value={subject._id}>
                        {subject.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item 
                  name="description" 
                  label={<span className="text-sm font-medium sm:text-base">Description</span>} 
                  rules={[{ required: true, message: 'Please enter description' }]}
                >
                  <TextArea 
                    rows={screens.sm ? 4 : 3} 
                    placeholder="Enter detailed description of the assignment"
                    className="text-sm rounded-md sm:text-base"
                  />
                </Form.Item>

                <Form.Item 
                  name="dueDate" 
                  label={<span className="text-sm font-medium sm:text-base">Due Date</span>} 
                  rules={[{ required: true, message: 'Please select due date' }]}
                >
                  <DatePicker 
                    className="w-full py-2 text-sm rounded-md sm:text-base" 
                    format="YYYY-MM-DD"
                    suffixIcon={<ClockCircleOutlined className="text-gray-400" />}
                    placeholder="Select assignment due date"
                  />
                </Form.Item>

                <Form.Item 
                  name="attachments" 
                  label={<span className="text-sm font-medium sm:text-base">Attachments</span>}
                >
                  <Upload 
                    maxCount={3} 
                    listType="picture" 
                    beforeUpload={() => false}
                    className="text-sm sm:text-base"
                  >
                    <Button 
                      icon={<UploadOutlined />}
                      className="flex items-center gap-1 text-sm rounded-md shadow h-9 sm:text-base sm:h-10 hover:shadow-md"
                    >
                      Upload Files (Max: 3)
                    </Button>
                  </Upload>
                </Form.Item>

                <Form.Item className="!mb-0 pt-2">
                  <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button 
                      onClick={() => {
                        setIsModalVisible(false);
                        resetModal();
                      }}
                      className="text-sm rounded-md h-9 sm:text-base sm:h-10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading} 
                      className="text-sm font-medium border-none rounded-md shadow h-9 sm:text-base sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                      icon={editingAssignment ? <CheckCircleOutlined /> : <PlusOutlined />}
                    >
                      {editingAssignment ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="inline-block p-2 text-white bg-red-500 rounded-full">
              <ExclamationCircleOutlined />
            </span>
            <Text className="text-lg font-semibold sm:text-xl">
              Confirm Delete
            </Text>
          </div>
        }
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        maskStyle={{ backdropFilter: 'blur(5px)', background: 'rgba(0, 0, 0, 0.45)' }}
        footer={null}
        width={420}
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            Are you sure you want to delete this assignment? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button 
              onClick={() => setIsDeleteModalVisible(false)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button 
              danger 
              type="primary" 
              onClick={handleDelete} 
              loading={loading}
              className="rounded-md shadow"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AssignmentManagement;