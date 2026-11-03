import { useEffect, useMemo, useState } from "react";
import { colors as palette } from "../../ui/colors";
import { useSearchParams } from "react-router-dom";
import { DatePicker, message } from "antd";
import dayjs from "dayjs";
import { BookOpen, Check, CheckCheck, CheckCircle2, RotateCcw, ScanFace, Users } from "lucide-react";
import { motion } from "framer-motion";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import useAttendanceStore from "../../../zustand/attendanceStore.js";
import { formatPercent, percent, titleCase } from "../../../lib/format";
import { DashboardHeader } from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import Switch from "../../ui/Switch";
import StatusBadge from "../../ui/StatusBadge";
import SegmentedControl from "../../ui/SegmentedControl";
import AttendanceRing from "../../ui/AttendanceRing";
import DataTable from "../../ui/DataTable";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState, ErrorState } from "../../ui/States";
import { SkeletonTable } from "../../ui/Skeleton";
import SubjectSelect from "../../dashboard/SubjectSelect";
import ImageUploadForAttendance from "./ImageUploadForAttendance";

import { AUTO_MARK_CONFIDENCE as CONFIDENCE_THRESHOLD } from "../../../lib/attendance";

// Recognition below CONFIDENCE_THRESHOLD is shown but not auto-marked present.

const STEPS = ["Choose class", "Add photo", "Review roster", "Save"];

// Four-step progress for the workflow. Step 2 is optional (manual marking).
const Steps = ({ current, done }) => (
  <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Attendance steps">
    {STEPS.map((label, i) => {
      const isDone = done.includes(i);
      const isCurrent = current === i && !isDone;
      return (
        <li key={label} className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-current={isCurrent ? "step" : undefined}>
          <span
            className={`flex h-7 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-[12px] font-medium transition-colors duration-300 ${
              isDone
                ? "bg-success/10 text-success"
                : isCurrent
                  ? "bg-brand/10 text-brand ring-1 ring-inset ring-brand/20"
                  : "text-ink-3"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                isDone ? "bg-success text-white dark:text-canvas" : isCurrent ? "bg-brand text-white" : "bg-ink/[0.07] dark:bg-white/10"
              }`}
            >
              {isDone ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : i + 1}
            </span>
            {label}
            {i === 1 && <span className="hidden text-[11px] font-normal opacity-70 sm:inline">optional</span>}
          </span>
          {i < STEPS.length - 1 && <span className="h-px w-3 bg-line-strong sm:w-6" aria-hidden="true" />}
        </li>
      );
    })}
  </ol>
);

const AttendanceSheet = () => {
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject"));
  const [attendanceDate, setAttendanceDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedInfo, setSavedInfo] = useState(null); // { key, present, total } of the last save in this visit
  const [recognition, setRecognition] = useState(null);
  const [filter, setFilter] = useState("all");
  const { attendanceRecords, addAttendanceRecord } = useAttendanceStore();
  const subjectsState = useAsync(fetchSubjects, []);
  const subjects = subjectsState.data || [];

  // Load the roster when the subject changes or a new recognition result lands.
  useEffect(() => {
    if (selectedSubject) loadStudents();
  }, [selectedSubject, attendanceRecords]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStudents = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await api.get("/users/students");

      // Latest recognition result that includes this subject
      const latestRecord = attendanceRecords
        .filter(
          (record) =>
            record?.subjects &&
            Array.isArray(record.subjects) &&
            record.subjects.some((subject) => subject && subject._id === selectedSubject),
        )
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

      const studentsWithAttendance = response.data.data.map((student) => ({
        id: student._id,
        name: student.fullName,
        semester: student.semester,
        present: false,
        confidence: 0,
      }));

      if (latestRecord && Array.isArray(latestRecord.students)) {
        studentsWithAttendance.forEach((student) => {
          const recognized = latestRecord.students.find(
            (rs) => rs?.name && student.name && rs.name.toLowerCase().trim() === student.name.toLowerCase().trim(),
          );
          if (recognized) {
            student.present = recognized.confidence >= CONFIDENCE_THRESHOLD;
            student.confidence = recognized.confidence;
          }
        });
        setRecognizedStudents(latestRecord.students);
      } else {
        setRecognizedStudents([]);
      }

      setAttendanceData(studentsWithAttendance);
    } catch (error) {
      console.error("Failed to load students:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedSubject || !attendanceDate || !attendanceData?.length) {
      message.error("Please ensure all required fields are filled");
      return;
    }
    setSubmitting(true);
    try {
      const attendancePayload = {
        subjectId: selectedSubject,
        date: attendanceDate.toDate(),
        students: attendanceData.map((student) => ({
          student: student.id,
          status: student.present ? "present" : "absent",
          confidence: student.confidence || null,
        })),
      };
      const currentSubject = subjects.find((subject) => subject._id === selectedSubject);
      const response = await api.post("/attendance/markattendance", attendancePayload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data) {
        const recognitionResults = attendanceData.map((student) => ({ name: student.name, confidence: student.confidence }));
        addAttendanceRecord(recognitionResults, currentSubject, null);
        message.success("Attendance saved");
        setSavedInfo({
          key: `${selectedSubject}|${attendanceDate.format("YYYY-MM-DD")}`,
          present: attendanceData.filter((st) => st.present).length,
          total: attendanceData.length,
        });
        await loadStudents();
      }
    } catch (error) {
      console.error("Attendance submission error:", error);
      message.error(error.response?.data?.message || "Failed to mark attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const setPresent = (id, present) => setAttendanceData((prev) => prev.map((s) => (s.id === id ? { ...s, present } : s)));
  const markAll = (present) => setAttendanceData((prev) => prev.map((s) => ({ ...s, present })));

  const totalStudents = attendanceData.length;
  const totalPresent = attendanceData.filter((s) => s.present).length;
  const totalAbsent = totalStudents - totalPresent;
  const rate = percent(totalPresent, totalStudents);
  const isRecognized = (name) => recognizedStudents.some((rs) => rs?.name && rs.name.toLowerCase().trim() === name.toLowerCase().trim());
  const needsReview = (r) => isRecognized(r.name) && r.confidence > 0 && r.confidence < CONFIDENCE_THRESHOLD;
  const subjectName = titleCase(subjects.find((s) => s._id === selectedSubject)?.name);
  const saved = savedInfo?.key === `${selectedSubject}|${attendanceDate.format("YYYY-MM-DD")}`;
  const reviewCount = attendanceData.filter(needsReview).length;

  const visibleRows = useMemo(() => {
    if (filter === "present") return attendanceData.filter((r) => r.present);
    if (filter === "absent") return attendanceData.filter((r) => !r.present);
    if (filter === "review") return attendanceData.filter(needsReview);
    return attendanceData;
  }, [attendanceData, filter, recognizedStudents]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = !selectedSubject ? 0 : !recognition && !attendanceData.some((s) => s.present) ? 1 : saved ? 3 : 2;
  const doneSteps = [
    ...(selectedSubject ? [0] : []),
    ...(recognition ? [1] : []),
    ...(saved ? [2, 3] : []),
  ];

  const recognitionPill = (r) =>
    isRecognized(r.name) ? (
      <StatusBadge tone={r.confidence >= CONFIDENCE_THRESHOLD ? "success" : "warning"} icon={ScanFace}>
        {(r.confidence * 100).toFixed(0)}%{r.confidence < CONFIDENCE_THRESHOLD ? " · review" : " match"}
      </StatusBadge>
    ) : (
      <span className="text-xs text-ink-3">Manual</span>
    );

  const columns = [
    {
      key: "name",
      header: "Student",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative">
            <Avatar name={r.name} size="md" />
            {r.present && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#20B99A] text-white ring-2 ring-surface">
                <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink-3">Semester {r.semester ?? "—"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "recognition",
      header: "Recognition",
      sortValue: (r) => (isRecognized(r.name) ? r.confidence : -1),
      render: (r) => recognitionPill(r),
    },
    {
      key: "actions",
      header: "Attendance",
      align: "right",
      render: (r) => (
        <Switch checked={r.present} onChange={(v) => setPresent(r.id, v)} label={`${r.name} present`} onLabel="Present" offLabel="Absent" />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DashboardHeader
        icon={ScanFace}
        color="indigo"
        eyebrow="Attendance"
        title="Take attendance"
        description="Pick a class, optionally run photo recognition, then review every student before saving."
        meta={<Steps current={step} done={doneSteps} />}
      />

      {/* Session: class, date and live totals */}
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),220px] xl:grid-cols-[minmax(0,1fr),220px,auto] xl:items-end">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-[13px] font-medium text-ink-2">
              Class
            </label>
            {subjectsState.error ? (
              <p className="text-[13px] text-danger">
                Couldn't load subjects.{" "}
                <button type="button" className="font-medium underline" onClick={() => subjectsState.reload()}>
                  Retry
                </button>
              </p>
            ) : (
              <SubjectSelect
                id="subject"
                subjects={subjects}
                loading={subjectsState.loading}
                value={selectedSubject}
                onChange={setSelectedSubject}
              />
            )}
          </div>
          <div>
            <label htmlFor="date" className="mb-1.5 block text-[13px] font-medium text-ink-2">
              Date
            </label>
            <DatePicker
              id="date"
              className="w-full"
              value={attendanceDate}
              onChange={(date) => setAttendanceDate(date)}
              allowClear={false}
              format="ddd, MMM D, YYYY"
            />
          </div>
          <div className="glass-well flex items-center gap-4 rounded-2xl px-3 py-2 md:col-span-2 xl:col-span-1">
            <AttendanceRing rate={rate} total={totalStudents} size={56} stroke={6} label={`Class attendance ${formatPercent(rate, 0)}`} />
            <dl className="grid flex-1 grid-cols-3 gap-4 xl:flex-none" aria-live="polite">
              {[
                ["Present", totalPresent, "text-success"],
                ["Absent", totalAbsent, "text-ink"],
                ["Students", totalStudents, "text-ink"],
              ].map(([label, value, tone]) => (
                <div key={label} className="min-w-[64px]">
                  <dt className="text-[11px] font-medium text-ink-3">{label}</dt>
                  <dd className={`text-xl font-semibold tabular-nums tracking-[-0.02em] ${tone}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr),minmax(0,7fr)]">
        <div className="min-w-0 lg:sticky lg:top-[88px]">
          <ImageUploadForAttendance
            subjects={subjects}
            addAttendanceRecord={addAttendanceRecord}
            roster={attendanceData}
            onResults={setRecognition}
          />
        </div>

        <Card className="min-w-0 overflow-clip" aria-labelledby="roster">
          <CardHeader
            id="roster"
            icon={Users}
            iconTile={palette.emerald.tile}
            title="Roster"
            description={
              subjectName
                ? `${subjectName} · ${attendanceDate.format("ddd, MMM D")}`
                : selectedSubject
                  ? "Loading…"
                  : "Select a class to load students"
            }
            action={
              attendanceData.length > 0 && (
                <Button size="sm" variant="ghost" icon={CheckCheck} onClick={() => markAll(totalPresent !== totalStudents)}>
                  <span className="hidden sm:inline">{totalPresent === totalStudents ? "Clear all" : "Mark all present"}</span>
                  <span className="sm:hidden">{totalPresent === totalStudents ? "Clear" : "All present"}</span>
                </Button>
              )
            }
          />

          {saved && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2.5 border-b border-line/70 bg-success/[0.08] px-5 py-2.5 text-[13px] text-success"
              role="status"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Saved for {attendanceDate.format("MMM D")}: {savedInfo.present} of {savedInfo.total} present. View it in Reports.
            </motion.div>
          )}

          <div>
            {!selectedSubject ? (
              <EmptyState icon={BookOpen} title="Choose a class" description="The roster loads once you pick a class above." />
            ) : loading && attendanceData.length === 0 ? (
              <SkeletonTable rows={6} />
            ) : loadError ? (
              <ErrorState title="We couldn't load the roster" onRetry={loadStudents} />
            ) : (
              <DataTable
                caption="Class roster"
                columns={columns}
                rows={visibleRows}
                rowKey="id"
                pageSize={12}
                search={{ placeholder: "Search students", getText: (r) => r.name }}
                toolbar={
                  attendanceData.length > 0 && (
                    <SegmentedControl
                      label="Show"
                      value={filter}
                      onChange={setFilter}
                      options={[
                        { value: "all", label: "All" },
                        { value: "present", label: `Present ${totalPresent}` },
                        { value: "absent", label: `Absent ${totalAbsent}` },
                        ...(reviewCount ? [{ value: "review", label: `Review ${reviewCount}` }] : []),
                      ]}
                    />
                  )
                }
                mobileRow={(r) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                      <div className="mt-0.5">
                        {recognitionPill(r)}
                      </div>
                    </div>
                    <Switch checked={r.present} onChange={(v) => setPresent(r.id, v)} label={`${r.name} present`} />
                  </div>
                )}
                empty={
                  filter !== "all" ? (
                    <EmptyState icon={Users} title="Nobody here" description="No students match this filter." compact />
                  ) : (
                    <EmptyState icon={Users} title="No students yet" description="Students appear here after they sign up." compact />
                  )
                }
              />
            )}
          </div>

          {attendanceData.length > 0 && (
            <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 bg-[rgb(var(--glass)/0.82)] px-4 py-3 backdrop-blur-xl sm:px-5 md:bottom-0">
              <p className="text-[13px] text-ink-2" aria-live="polite">
                <span className="font-semibold tabular-nums text-ink">{totalPresent}</span> of {totalStudents} present
                {reviewCount > 0 && <span className="text-warning"> · {reviewCount} to review</span>}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" icon={RotateCcw} onClick={loadStudents} disabled={submitting}>
                  Reset
                </Button>
                <Button
                  variant="primary"
                  icon={CheckCircle2}
                  loading={submitting}
                  disabled={!selectedSubject}
                  onClick={handleAttendanceSubmit}
                >
                  Save attendance
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AttendanceSheet;
