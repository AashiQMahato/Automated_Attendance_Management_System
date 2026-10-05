import React, { useMemo, useState } from "react";
import { Drawer, Modal, Upload, message, Progress } from "antd";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  Inbox,
  Upload as UploadIcon,
} from "lucide-react";
import store from "../../../zustand/loginStore";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { dayjs, dueStatus } from "../../../lib/format";
import { useTheme } from "../../../theme/ThemeProvider";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import SegmentedControl from "../../ui/SegmentedControl";
import DataTable from "../../ui/DataTable";
import { Card } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import { SkeletonTable } from "../../ui/Skeleton";
import AsyncContent from "../../ui/AsyncContent";

const fileIcon = (url) => {
  const ext = url.split(".").pop().toLowerCase();
  if (["xlsx", "xls", "csv"].includes(ext)) return FileSpreadsheet;
  if (["jpg", "jpeg", "png", "heic", "webp"].includes(ext)) return FileImage;
  return FileText;
};

const StudentAssignmentViewer = () => {
  const { loginUserData } = store((state) => state);
  const { colors } = useTheme();
  // The previous version compared against localStorage "userId", which is
  // never written; the signed-in user's id lives in the login store.
  const studentId = loginUserData?._id || localStorage.getItem("userId");

  const {
    data: assignments = [],
    loading,
    error,
    reload: fetchAssignments,
  } = useAsync(() => api.get("/assignments").then((res) => res.data.data || []), []);
  const [filter, setFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mySubmission = (a) => a.submissions?.find((sub) => sub.student === studentId);

  const getStatus = (a) => {
    const sub = mySubmission(a);
    if (sub)
      return sub.grade !== undefined && sub.grade !== null
        ? { key: "graded", tone: "success", label: `Graded · ${sub.grade}%` }
        : { key: "submitted", tone: "success", label: "Submitted" };
    const due = dueStatus(a.dueDate);
    return { ...due, key: due.key === "overdue" ? "overdue" : "todo" };
  };

  const handleSubmission = async () => {
    if (!uploadFile) {
      message.error("Please select a file to submit");
      return;
    }
    setSubmitting(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("files", uploadFile);
    try {
      await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      message.success("Assignment submitted");
      setSubmitModalVisible(false);
      fetchAssignments({ silent: true });
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setSubmitting(false);
      setUploadFile(null);
      setUploadProgress(0);
    }
  };

  const counts = useMemo(() => {
    const c = { all: assignments.length, todo: 0, done: 0, overdue: 0 };
    assignments.forEach((a) => {
      const k = getStatus(a).key;
      if (k === "todo") c.todo += 1;
      else if (k === "overdue") c.overdue += 1;
      else c.done += 1;
    });
    return c;
  }, [assignments]); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    if (filter === "all") return assignments;
    return assignments.filter((a) => {
      const k = getStatus(a).key;
      return filter === "done" ? k === "submitted" || k === "graded" : k === filter;
    });
  }, [assignments, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDetails = (a) => {
    setSelectedAssignment(a);
    setDrawerVisible(true);
  };
  const openSubmit = (a) => {
    setSelectedAssignment(a);
    setSubmitModalVisible(true);
  };

  const columns = [
    {
      key: "title",
      header: "Assignment",
      sortValue: (r) => r.title.toLowerCase(),
      render: (r) => (
        <button type="button" onClick={() => openDetails(r)} className="focus-ring -mx-1 rounded px-1 text-left">
          <p className="font-medium text-ink hover:text-brand">{r.title}</p>
          <p className="text-xs text-ink-3">{r.subject?.name}</p>
        </button>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      sortValue: (r) => new Date(r.dueDate).getTime(),
      render: (r) => <span className="tabular-nums">{dayjs(r.dueDate).format("MMM D, YYYY")}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const s = getStatus(r);
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      render: (r) => (
        <div className="inline-flex gap-2">
          <Button size="sm" variant="ghost" icon={Eye} onClick={() => openDetails(r)}>
            View
          </Button>
          {!mySubmission(r) && (
            <Button size="sm" variant="primary" icon={UploadIcon} onClick={() => openSubmit(r)}>
              Submit
            </Button>
          )}
        </div>
      ),
    },
  ];

  const sub = selectedAssignment && mySubmission(selectedAssignment);

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Track due dates, submissions and grades." />

      <Card className="overflow-hidden">
        <AsyncContent
          bare
          loading={loading}
          error={error}
          onRetry={fetchAssignments}
          loadingLabel="Loading assignments"
          errorTitle="We couldn't load your assignments"
          skeleton={<SkeletonTable />}
        >
          <DataTable
            caption="Assignments"
            columns={columns}
            rows={rows}
            pageSize={8}
            initialSort={{ key: "dueDate", dir: "asc" }}
            search={{ placeholder: "Search assignments", getText: (r) => `${r.title} ${r.subject?.name || ""}` }}
            toolbar={
              <SegmentedControl
                label="Filter assignments"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: "all", label: `All ${counts.all}` },
                  { value: "todo", label: `To do ${counts.todo}` },
                  { value: "done", label: `Done ${counts.done}` },
                  { value: "overdue", label: `Overdue ${counts.overdue}` },
                ]}
              />
            }
            empty={
              <EmptyState
                icon={filter === "all" ? ClipboardList : Inbox}
                title={filter === "all" ? "No assignments yet" : "Nothing here"}
                description={
                  filter === "all" ? "When teachers post assignments, they'll appear here." : "No assignments match this filter."
                }
                compact={filter !== "all"}
              />
            }
          />
        </AsyncContent>
      </Card>

      <Drawer
        title={selectedAssignment?.title}
        placement="right"
        width={typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : 480}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          selectedAssignment &&
          !sub && (
            <Button
              size="sm"
              variant="primary"
              icon={UploadIcon}
              onClick={() => {
                setDrawerVisible(false);
                setSubmitModalVisible(true);
              }}
            >
              Submit
            </Button>
          )
        }
      >
        {selectedAssignment && (
          <div className="space-y-6 text-sm">
            <dl className="grid grid-cols-2 gap-4 rounded-xl border border-line p-4">
              <div>
                <dt className="text-xs text-ink-3">Subject</dt>
                <dd className="mt-0.5 font-medium text-ink">{selectedAssignment.subject?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-3">Status</dt>
                <dd className="mt-1">
                  <StatusBadge tone={getStatus(selectedAssignment).tone}>{getStatus(selectedAssignment).label}</StatusBadge>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-ink-3">Due</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-ink">
                  <CalendarClock className="h-4 w-4 text-ink-3" aria-hidden="true" />
                  {dayjs(selectedAssignment.dueDate).format("dddd, MMMM D, YYYY · h:mm A")}
                </dd>
              </div>
            </dl>

            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">Description</h3>
              <p className="whitespace-pre-line leading-6 text-ink-2">{selectedAssignment.description}</p>
            </section>

            {selectedAssignment.attachments?.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">Attachments</h3>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {selectedAssignment.attachments.map((file, index) => {
                    const Icon = fileIcon(file);
                    return (
                      <li key={index} className="flex items-center gap-3 px-3 py-2.5">
                        <Icon className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-ink-2">{file.split("/").pop()}</span>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          icon={Download}
                          aria-label="Download attachment"
                          onClick={() => window.open(file, "_blank")}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {sub && (
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-3">Your submission</h3>
                <div className="rounded-xl border border-line p-4">
                  <p className="flex items-center gap-2 font-medium text-ink">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    Submitted {sub.submittedAt ? dayjs(sub.submittedAt).format("MMM D, h:mm A") : ""}
                  </p>
                  {sub.grade !== undefined && sub.grade !== null && (
                    <div className="mt-4">
                      <Progress percent={sub.grade} strokeColor={colors.brand} />
                      <p className="mt-3 text-xs font-medium text-ink-3">Feedback</p>
                      <p className="mt-1 rounded-lg bg-surface-2 p-3 text-ink-2">{sub.feedback || "No feedback provided"}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            {!sub && dayjs(selectedAssignment.dueDate).isBefore(dayjs()) && (
              <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-danger">
                <Clock className="h-4 w-4" aria-hidden="true" />
                The due date has passed.
              </p>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        title="Submit assignment"
        open={submitModalVisible}
        onCancel={() => {
          setSubmitModalVisible(false);
          setUploadFile(null);
          setUploadProgress(0);
        }}
        onOk={handleSubmission}
        okButtonProps={{ loading: submitting, disabled: !uploadFile }}
        okText="Submit"
        destroyOnClose
        width={520}
      >
        {selectedAssignment && <p className="mb-4 text-sm text-ink-2">{selectedAssignment.title}</p>}
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
          <div className="flex flex-col items-center py-2">
            <UploadIcon className="mb-2 h-6 w-6 text-ink-3" aria-hidden="true" />
            <p className="text-sm font-medium text-ink">Click or drag a file to upload</p>
            <p className="mt-1 text-xs text-ink-3">PDF, DOC, DOCX or image files</p>
          </div>
        </Upload.Dragger>
        {uploadFile && uploadProgress > 0 && <Progress percent={uploadProgress} className="mt-4" strokeColor={colors.brand} />}
      </Modal>
    </div>
  );
};

export default StudentAssignmentViewer;
