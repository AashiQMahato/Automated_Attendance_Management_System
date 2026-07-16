import React, { useState, useEffect } from 'react';
import {
  Table, Tag,
  Button,
  Modal,
  Upload,
  message,
  Drawer,
  Space,
  Descriptions,
  Empty,
  Progress,
  Tooltip,
  Grid
} from 'antd';
import {
  CloudUploadOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  CalendarOutlined,
  LoadingOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import store from '../../../zustand/loginStore';
dayjs.extend(relativeTime);

const { useBreakpoint } = Grid;

const StudentAssignmentViewer = () => {
  const screens = useBreakpoint();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { loginUserData } = store((state) => state);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${loginUserData.baseURL}/assignments`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
      setAssignments(response.data.data);
    } catch (error) {
      message.error({
        content: 'Failed to fetch assignments',
        icon: <CloseCircleOutlined style={{ color: '#e11d48' }} />
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmission = async () => {
    if (!uploadFile) {
      message.error('Please select a file to submit');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('files', uploadFile);

    try {
      await axios.post(
        `${loginUserData.baseURL}/assignments/${selectedAssignment._id}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );

      message.success({
        content: 'Assignment submitted successfully',
        icon: <CheckCircleOutlined style={{ color: '#10b981' }} />
      });
      setSubmitModalVisible(false);
      fetchAssignments();
    } catch (error) {
      message.error({
        content: error.response?.data?.message || 'Failed to submit assignment',
        icon: <CloseCircleOutlined style={{ color: '#e11d48' }} />
      });
    } finally {
      setSubmitting(false);
      setUploadFile(null);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined className="text-lg text-red-500" />;
      case 'xlsx':
      case 'xls':
        return <FileExcelOutlined className="text-lg text-emerald-500" />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined className="text-lg text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImageOutlined className="text-lg text-violet-500" />;
      default:
        return <FileImageOutlined className="text-lg text-slate-400" />;
    }
  };

  const getStatusTag = (assignment) => {
    const studentSubmission = assignment.submissions?.find(
      sub => sub.student === localStorage.getItem('userId')
    );
    const isOverdue = dayjs(assignment.dueDate).isBefore(dayjs());

    if (studentSubmission) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          {studentSubmission.grade ? `Graded: ${studentSubmission.grade}%` : 'Submitted'}
        </Tag>
      );
    }
    if (isOverdue) {
      return <Tag icon={<ClockCircleOutlined />} color="error">Overdue</Tag>;
    }
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning">
        Due {dayjs(assignment.dueDate).fromNow()}
      </Tag>
    );
  };

  const downloadFile = (url) => {
    window.open(url, '_blank');
  };

  const responsiveColumns = () => {
    const baseColumns = [
      {
        title: 'Assignment',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 md:text-base">{text}</span>
            <span className="text-xs text-slate-500 md:text-sm">
              {record.subject.name}
            </span>
          </div>
        ),
      },
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        key: 'dueDate',
        responsive: ['md'],
        render: (date) => (
          <Tooltip title={dayjs(date).format('MMMM D, YYYY h:mm A')}>
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CalendarOutlined />
              {dayjs(date).format(screens.md ? 'MMM D, YYYY' : 'MM/DD/YY')}
            </span>
          </Tooltip>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        responsive: ['sm'],
        render: (_, record) => getStatusTag(record),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <Space direction={screens.md ? 'horizontal' : 'vertical'}>
            <Tooltip title="View Details">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedAssignment(record);
                  setDrawerVisible(true);
                }}
                size={screens.md ? 'default' : 'small'}
              >
                {screens.md ? 'View' : null}
              </Button>
            </Tooltip>
            {!record.submissions?.some(sub => sub.student === localStorage.getItem('userId')) && (
              <Tooltip title="Submit Assignment">
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={() => {
                    setSelectedAssignment(record);
                    setSubmitModalVisible(true);
                  }}
                  size={screens.md ? 'default' : 'small'}
                >
                  {screens.md ? 'Submit' : null}
                </Button>
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return baseColumns.filter(col => !col.responsive || col.responsive.some(br => screens[br]));
  };

  return (
    <div>
      <div className="p-4 bg-white border shadow-sm rounded-xl border-slate-200 md:p-6">
        <div className="mb-4 md:mb-6">
          <h2 className="text-lg font-semibold text-slate-900">My assignments</h2>
          <p className="mt-0.5 text-sm text-slate-500">Track due dates, submissions and grades</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20" aria-busy="true" aria-live="polite">
            <LoadingOutlined style={{ fontSize: 32, color: '#4f46e5' }} spin />
            <p className="mt-3 text-sm text-slate-500">Loading assignments…</p>
          </div>
        ) : assignments.length === 0 ? (
          <Empty
            description="No assignments found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            className="my-8"
          />
        ) : (
          <Table
            columns={responsiveColumns()}
            dataSource={assignments}
            rowKey="_id"
            pagination={{
              pageSize: 8,
              showSizeChanger: false
            }}
            scroll={{ x: true }}
            size={screens.md ? 'default' : 'middle'}
          />
        )}
      </div>

      <Drawer
        title={<span className="text-base font-semibold text-slate-900 md:text-lg">{selectedAssignment?.title}</span>}
        placement="right"
        width={screens.md ? 480 : '100%'}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedAssignment && (
          <div className="space-y-6">
            <Descriptions bordered column={1} size={screens.md ? 'default' : 'small'}>
              <Descriptions.Item label="Subject">
                {selectedAssignment.subject.name}
              </Descriptions.Item>
              <Descriptions.Item label="Due Date">
                {dayjs(selectedAssignment.dueDate).format(
                  screens.md ? 'MMMM D, YYYY h:mm A' : 'MMM D, YYYY'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedAssignment)}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h5 className="mb-2 text-sm font-semibold text-slate-900">Description</h5>
              <p className="p-3 text-sm border rounded-lg border-slate-100 bg-slate-50 text-slate-600">
                {selectedAssignment.description}
              </p>
            </div>

            {selectedAssignment.attachments?.length > 0 && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-slate-900">Attachments</h5>
                <div className="space-y-2">
                  {selectedAssignment.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 transition-colors border rounded-lg border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center min-w-0 gap-2">
                        {getFileIcon(file)}
                        <span className="text-sm truncate text-slate-700">{file.split('/').pop()}</span>
                      </div>
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadFile(file)}
                        size="small"
                        aria-label="Download attachment"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAssignment.submissions?.find(
              sub => sub.student === localStorage.getItem('userId')
            ) && (
              <div>
                <h5 className="mb-2 text-sm font-semibold text-slate-900">Your submission</h5>
                <div className="p-4 border rounded-lg border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Submitted successfully</span>
                    <CheckCircleOutlined className="text-lg text-emerald-500" />
                  </div>

                  {selectedAssignment.submissions[0].grade && (
                    <div className="mt-3">
                      <Progress
                        percent={selectedAssignment.submissions[0].grade}
                        status="active"
                        strokeColor="#4f46e5"
                      />
                      <div className="mt-3 text-sm text-slate-600">
                        <strong className="text-slate-800">Feedback</strong>
                        <div className="mt-1.5 rounded-lg border border-slate-100 bg-slate-50 p-3">
                          {selectedAssignment.submissions[0].feedback || 'No feedback provided'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title={
          <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
            <CloudUploadOutlined className="text-indigo-600" />
            Submit assignment
          </span>
        }
        open={submitModalVisible}
        onCancel={() => {
          setSubmitModalVisible(false);
          setUploadFile(null);
          setUploadProgress(0);
        }}
        onOk={handleSubmission}
        okButtonProps={{ loading: submitting }}
        okText="Submit"
        destroyOnClose
        width={screens.md ? 520 : '90%'}
      >
        <div className="pt-2 text-center">
          <Upload.Dragger
            maxCount={1}
            beforeUpload={(file) => {
              setUploadFile(file);
              return false;
            }}
            onRemove={() => {
              setUploadFile(null);
              setUploadProgress(0);
            }}
            fileList={uploadFile ? [uploadFile] : []}
          >
            <p className="text-2xl text-indigo-500">
              <InboxOutlined />
            </p>
            <p className="text-sm text-slate-700 md:text-base">Click or drag file to upload</p>
            <p className="text-xs text-slate-400 md:text-sm">Support for PDF, DOC, DOCX, and image files</p>
          </Upload.Dragger>

          {uploadFile && uploadProgress > 0 && (
            <Progress percent={uploadProgress} status="active" className="mt-4" strokeColor="#4f46e5" />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignmentViewer;