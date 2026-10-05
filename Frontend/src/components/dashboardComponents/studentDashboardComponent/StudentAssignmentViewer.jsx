import React, { useMemo, useState } from "react";
import { colorFor, colors as palette } from "../../ui/colors";
import { Modal, Upload, message, Progress } from "antd";
import {
  AlertCircle,
  CloudUpload,
  MessageSquareQuote,
  Paperclip,
  UserRound,
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
import { dayjs, dueStatus, titleCase } from "../../../lib/format";
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
import SidePanel, { PanelSection } from "../../ui/SidePanel";
import DateTile from "../../ui/DateTile";
import { ProgressRing } from "../../ui/Progress";

const fileMeta = (url) => {
  const ext = url.split("?")[0].split(".").pop().toLowerCase();
  if (["xlsx", "xls", "csv"].includes(ext)) return { Icon: FileSpreadsheet, color: "emerald", ext };
  if (["jpg", "jpeg", "png", "heic", "webp", "gif"].includes(ext)) return { Icon: FileImage, color: "violet", ext };
  if (ext === "pdf") return { Icon: FileText, color: "rose", ext };
  return { Icon: FileText, color: "sky", ext };
};

const gradeTone = (g) => (g >= 75 ? "success" : g >= 50 ? "warning" : "danger");

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
          <p className="font-medium text-ink hover:text-brand">{titleCase(r.title)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3">
            <span className={`h-2 w-2 rounded-full ${palette[colorFor(r.subject?._id)].dot}`} aria-hidden="true" />
            {titleCase(r.subject?.name)}
          </p>
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
    <div className="space-y-4">
      <PageHeader icon={ClipboardList} color="amber" title="Assignments" description="Track due dates, submissions and grades." />

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

      <SidePanel
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        label={titleCase(selectedAssignment?.title)}
        width={520}
        accent={
          {
            indigo: "from-indigo-50",
            emerald: "from-emerald-50",
            amber: "from-amber-50",
            sky: "from-sky-50",
            violet: "from-violet-50",
            rose: "from-rose-50",
            cyan: "from-cyan-50",
            fuchsia: "from-fuchsia-50",
          }[colorFor(selectedAssignment?.subject?._id)] + " via-white/40 to-transparent"
        }
        header={
          selectedAssignment && (
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${palette[colorFor(selectedAssignment.subject?._id)].tile}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${palette[colorFor(selectedAssignment.subject?._id)].dot}`} aria-hidden="true" />
                {titleCase(selectedAssignment.subject?.name)}
                {selectedAssignment.subject?.code && <span className="opacity-70">· {selectedAssignment.subject.code}</span>}
              </span>
              <h2 className="mt-3 text-[22px] font-bold leading-tight tracking-[-0.025em] text-ink">
                {titleCase(selectedAssignment.title)}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-ink-3">
                <StatusBadge tone={getStatus(selectedAssignment).tone}>{getStatus(selectedAssignment).label}</StatusBadge>
                {selectedAssignment.teacher?.fullName && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
                    {selectedAssignment.teacher.fullName}
                  </span>
                )}
                {selectedAssignment.createdAt && <span>Posted {dayjs(selectedAssignment.createdAt).fromNow()}</span>}
              </div>
            </div>
          )
        }
        footer={
          selectedAssignment &&
          (sub ? (
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Submitted{sub.submittedAt ? ` ${dayjs(sub.submittedAt).format("MMM D")}` : ""}
              </span>
              <Button onClick={() => setDrawerVisible(false)}>Close</Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setDrawerVisible(false)} className="flex-1 sm:flex-none">
                Close
              </Button>
              <Button
                variant="primary"
                icon={CloudUpload}
                className="flex-1"
                onClick={() => {
                  setDrawerVisible(false);
                  setSubmitModalVisible(true);
                }}
              >
                Submit assignment
              </Button>
            </div>
          ))
        }
      >
        {selectedAssignment && (
          <>
            {/* Due date */}
            <div
              className={`flex items-center gap-4 rounded-2xl p-4 ${palette[getStatus(selectedAssignment).key === "overdue" ? "rose" : "amber"].soft}`}
            >
              <DateTile
                date={selectedAssignment.dueDate}
                color={getStatus(selectedAssignment).key === "overdue" ? "rose" : "amber"}
                size="lg"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">Due</p>
                <p className="mt-0.5 text-[15px] font-semibold text-ink">{dayjs(selectedAssignment.dueDate).format("dddd, MMMM D")}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-2">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {dayjs(selectedAssignment.dueDate).format("h:mm A")} · {dayjs(selectedAssignment.dueDate).fromNow()}
                </p>
              </div>
            </div>

            {!sub && dayjs(selectedAssignment.dueDate).isBefore(dayjs()) && (
              <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-danger/10 px-3.5 py-3 text-[13px] text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                The due date has passed. You can still submit, but it may be marked late.
              </p>
            )}

            <PanelSection title="Instructions">
              <div className="rounded-2xl border border-line bg-surface-2/40 p-4">
                <p className="whitespace-pre-line text-[14px] leading-6 text-ink-2">{selectedAssignment.description}</p>
              </div>
            </PanelSection>

            <PanelSection
              title="Attachments"
              action={
                selectedAssignment.attachments?.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs text-ink-3">
                    <Paperclip className="h-3 w-3" aria-hidden="true" />
                    {selectedAssignment.attachments.length}
                  </span>
                )
              }
            >
              {selectedAssignment.attachments?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedAssignment.attachments.map((file, index) => {
                    const { Icon, color, ext } = fileMeta(file);
                    return (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => window.open(file, "_blank")}
                          className="focus-ring group flex w-full items-center gap-3 rounded-xl border border-line p-2.5 text-left transition-[border-color,box-shadow] hover:border-brand/30 hover:shadow-card"
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${palette[color].tile}`}>
                            <Icon className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-ink">
                              {decodeURIComponent(file.split("/").pop())}
                            </span>
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-3">{ext}</span>
                          </span>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-ink-3 transition-colors group-hover:bg-brand/10 group-hover:text-brand">
                            <Download className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="sr-only">Download</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-line px-4 py-3 text-[13px] text-ink-3">No files attached.</p>
              )}
            </PanelSection>

            {sub && (
              <PanelSection title="Your submission">
                <div className="rounded-2xl border border-line p-4">
                  {sub.grade !== undefined && sub.grade !== null ? (
                    <div className="flex items-center gap-4">
                      <ProgressRing value={sub.grade} size={72} stroke={7} tone={gradeTone(sub.grade)} label={`Grade ${sub.grade}%`}>
                        <span className="text-base font-bold tabular-nums text-ink">{sub.grade}</span>
                      </ProgressRing>
                      <div>
                        <p className="text-[15px] font-semibold text-ink">Graded · {sub.grade}%</p>
                        <p className="mt-0.5 text-[13px] text-ink-3">
                          Submitted {sub.submittedAt ? dayjs(sub.submittedAt).format("MMM D, h:mm A") : ""}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="flex items-center gap-2.5 text-[14px] font-medium text-ink">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${palette.emerald.tile}`}>
                        <CheckCircle2 className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      Submitted {sub.submittedAt ? dayjs(sub.submittedAt).format("MMM D, h:mm A") : ""} · awaiting grade
                    </p>
                  )}
                  {sub.grade !== undefined && sub.grade !== null && (
                    <div className="mt-4 flex gap-3 rounded-xl bg-surface-2/60 p-3.5">
                      <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      <p className="text-[13px] leading-5 text-ink-2">{sub.feedback || "No feedback provided."}</p>
                    </div>
                  )}
                </div>
              </PanelSection>
            )}
          </>
        )}
      </SidePanel>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <span className="bg-brand-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-glow">
              <CloudUpload className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink">Submit assignment</p>
              {selectedAssignment && <p className="truncate text-[13px] font-normal text-ink-3">{titleCase(selectedAssignment.title)}</p>}
            </div>
          </div>
        }
        open={submitModalVisible}
        onCancel={() => {
          setSubmitModalVisible(false);
          setUploadFile(null);
          setUploadProgress(0);
        }}
        footer={null}
        destroyOnClose
        width={520}
      >
        <div className="pt-3">
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
            className="[&_.ant-upload-drag]:!rounded-2xl [&_.ant-upload-drag]:!border-indigo-200 [&_.ant-upload-drag]:!bg-gradient-to-b [&_.ant-upload-drag]:!from-indigo-50/70 [&_.ant-upload-drag]:!to-transparent dark:[&_.ant-upload-drag]:!border-indigo-500/30 dark:[&_.ant-upload-drag]:!from-indigo-500/10"
          >
            <div className="flex flex-col items-center px-4 py-4">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand shadow-card dark:bg-surface-2">
                <UploadIcon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-ink">
                Drop your file here or <span className="text-brand">browse</span>
              </p>
              <p className="mt-1 text-xs text-ink-3">PDF, DOC, DOCX or image files</p>
            </div>
          </Upload.Dragger>
          {uploadFile && uploadProgress > 0 && <Progress percent={uploadProgress} className="mt-4" strokeColor={colors.brand} />}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              onClick={() => {
                setSubmitModalVisible(false);
                setUploadFile(null);
                setUploadProgress(0);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" icon={CloudUpload} loading={submitting} disabled={!uploadFile} onClick={handleSubmission}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentAssignmentViewer;
