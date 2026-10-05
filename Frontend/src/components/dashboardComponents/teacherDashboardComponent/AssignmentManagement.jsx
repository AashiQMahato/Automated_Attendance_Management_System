import React, { useEffect, useState } from "react";
import { DatePicker, Form, Input, Modal, Select, Upload, message } from "antd";
import { ClipboardList, Paperclip, Pencil, Plus, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { dueStatus } from "../../../lib/format";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import DataTable from "../../ui/DataTable";
import AsyncContent from "../../ui/AsyncContent";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import { SkeletonTable } from "../../ui/Skeleton";

const { TextArea } = Input;

const AssignmentManagement = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const assignmentsState = useAsync(() => api.get("/assignments").then((res) => res.data.data || []), []);
  const subjectsState = useAsync(fetchSubjects, []);
  const assignments = assignmentsState.data || [];
  const subjects = subjectsState.data || [];

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

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("subject", values.subject);
      formData.append("dueDate", values.dueDate.format("YYYY-MM-DD"));
      values.attachments?.fileList?.forEach((file) => formData.append("files", file.originFileObj));
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editingAssignment) {
        await api.put(`/assignments/${editingAssignment._id}`, formData, config);
        message.success("Assignment updated");
      } else {
        await api.post("/assignments", formData, config);
        message.success("Assignment created");
      }
      closeModal();
      assignmentsState.reload({ silent: true });
    } catch {
      message.error(editingAssignment ? "Failed to update assignment" : "Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/assignments/${assignmentToDelete._id}`);
      message.success("Assignment deleted");
      assignmentsState.reload({ silent: true });
    } catch {
      message.error("Failed to delete assignment");
    } finally {
      setDeleting(false);
      setAssignmentToDelete(null);
    }
  };

  const openCreate = () => {
    setEditingAssignment(null);
    form.resetFields();
    setIsModalVisible(true);
  };
  const openEdit = (assignment) => {
    setEditingAssignment(assignment);
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
    setEditingAssignment(null);
    form.resetFields();
  };

  const columns = [
    {
      key: "title",
      header: "Assignment",
      sortValue: (r) => r.title.toLowerCase(),
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-3">
            {r.subject?.name}
            {r.attachments?.length > 0 && (
              <span className="inline-flex items-center gap-0.5">
                · <Paperclip className="h-3 w-3" aria-hidden="true" />
                {r.attachments.length}
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      sortValue: (r) => new Date(r.dueDate).getTime(),
      render: (r) => <span className="tabular-nums">{dayjs(r.dueDate).format("MMM D, YYYY")}</span>,
    },
    {
      key: "submissions",
      header: "Submissions",
      align: "right",
      sortValue: (r) => r.submissions?.length || 0,
      render: (r) => <span className="tabular-nums">{r.submissions?.length || 0}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const s = dueStatus(r.dueDate);
        return <StatusBadge tone={s.tone}>{s.key === "upcoming" ? "Open" : s.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      render: (r) => (
        <div className="inline-flex gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            icon={Trash2}
            aria-label={`Delete ${r.title}`}
            onClick={() => setAssignmentToDelete(r)}
            className="hover:!bg-danger/10 hover:!text-danger"
          />
        </div>
      ),
    },
  ];

  const label = (text) => <span className="text-[13px] font-medium text-ink-2">{text}</span>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Create, manage and track student assignments."
        actions={
          <Button variant="primary" icon={Plus} onClick={openCreate}>
            New assignment
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <AsyncContent
          bare
          loading={assignmentsState.loading}
          error={assignmentsState.error}
          onRetry={assignmentsState.reload}
          loadingLabel="Loading assignments"
          errorTitle="We couldn't load assignments"
          skeleton={<SkeletonTable />}
        >
          <DataTable
            caption="Assignments"
            columns={columns}
            rows={assignments}
            pageSize={8}
            initialSort={{ key: "dueDate", dir: "desc" }}
            search={{ placeholder: "Search assignments", getText: (r) => `${r.title} ${r.subject?.name || ""}` }}
            empty={
              <EmptyState
                icon={ClipboardList}
                title="No assignments yet"
                description="Create one to share work and collect submissions."
                action={
                  <Button size="sm" variant="primary" icon={Plus} onClick={openCreate}>
                    New assignment
                  </Button>
                }
              />
            }
          />
        </AsyncContent>
      </Card>

      <Modal
        title={editingAssignment ? "Edit assignment" : "New assignment"}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={540}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} className="pt-2">
          <Form.Item name="title" label={label("Title")} rules={[{ required: true, message: "Please enter a title" }]}>
            <Input placeholder="e.g. Lab report 3" />
          </Form.Item>
          <Form.Item name="subject" label={label("Subject")} rules={[{ required: true, message: "Please select a subject" }]}>
            <Select
              placeholder="Select subject"
              options={subjects.map((s) => ({ value: s._id, label: s.name }))}
              loading={subjectsState.loading}
            />
          </Form.Item>
          <Form.Item name="description" label={label("Description")} rules={[{ required: true, message: "Please enter a description" }]}>
            <TextArea rows={4} placeholder="What should students do?" />
          </Form.Item>
          <Form.Item name="dueDate" label={label("Due date")} rules={[{ required: true, message: "Please select a due date" }]}>
            <DatePicker className="w-full" format="ddd, MMM D, YYYY" />
          </Form.Item>
          <Form.Item name="attachments" label={label("Attachments")} extra={<span className="text-xs text-ink-3">Up to 3 files</span>}>
            <Upload maxCount={3} beforeUpload={() => false}>
              <Button icon={Paperclip} size="sm">
                Attach files
              </Button>
            </Upload>
          </Form.Item>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingAssignment ? "Save changes" : "Create assignment"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal title="Delete assignment?" open={!!assignmentToDelete} onCancel={() => setAssignmentToDelete(null)} footer={null} width={420}>
        <p className="text-sm text-ink-2">“{assignmentToDelete?.title}” and its submissions will be removed. This can't be undone.</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setAssignmentToDelete(null)}>Cancel</Button>
          <Button variant="danger" icon={Trash2} loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AssignmentManagement;
