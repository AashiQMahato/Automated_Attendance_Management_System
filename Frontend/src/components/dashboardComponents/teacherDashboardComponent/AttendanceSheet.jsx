import React, { useEffect, useState } from "react";
import { colorFor, colors as palette } from "../../ui/colors";
import { useSearchParams } from "react-router-dom";
import { DatePicker, message } from "antd";
import dayjs from "dayjs";
import { BookOpen, CheckCheck, CheckCircle2, Users, ScanFace } from "lucide-react";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import useAttendanceStore from "../../../zustand/attendanceStore.js";
import { formatPercent, percent, titleCase } from "../../../lib/format";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import Switch from "../../ui/Switch";
import StatusBadge from "../../ui/StatusBadge";
import InlineStats from "../../ui/InlineStats";
import DataTable from "../../ui/DataTable";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState, ErrorState } from "../../ui/States";
import { SkeletonTable } from "../../ui/Skeleton";
import SubjectSelect from "../../dashboard/SubjectSelect";
import ImageUploadForAttendance from "./ImageUploadForAttendance";

// Recognition below this confidence is shown but not auto-marked present.
const CONFIDENCE_THRESHOLD = 0.7;

const AttendanceSheet = () => {
  const [searchParams] = useSearchParams();
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject"));
  const [attendanceDate, setAttendanceDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState([]);
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
  const subjectName = titleCase(subjects.find((s) => s._id === selectedSubject)?.name);

  const columns = [
    {
      key: "name",
      header: "Student",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={r.name} size="md" />
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
      render: (r) =>
        isRecognized(r.name) ? (
          <StatusBadge tone={r.confidence >= CONFIDENCE_THRESHOLD ? "info" : "warning"}>
            {(r.confidence * 100).toFixed(0)}% match
          </StatusBadge>
        ) : (
          <span className="text-ink-3">—</span>
        ),
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
      <PageHeader
        icon={ScanFace}
        color="indigo"
        title="Take attendance"
        description="Pick a class, optionally run photo recognition, then review and save."
      />

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr),220px] lg:grid-cols-[minmax(0,1fr),220px,minmax(0,1.1fr)] lg:items-end">
          <div>
            <label htmlFor="subject" className="mb-1.5 block text-[13px] font-medium text-ink-2">
              Subject
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
          <InlineStats
            className="md:col-span-2 lg:col-span-1"
            items={[
              { label: "Students", value: totalStudents },
              { label: "Present", value: totalPresent, tone: totalPresent ? "success" : "default" },
              { label: "Absent", value: totalAbsent },
              { label: "Rate", value: totalStudents ? formatPercent(rate, 0) : "—" },
            ]}
          />
        </div>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="lg:sticky lg:top-20 lg:col-span-2">
          <ImageUploadForAttendance subjects={subjects} addAttendanceRecord={addAttendanceRecord} />
        </div>

        <Card className="overflow-clip lg:col-span-3" aria-labelledby="roster">
          <CardHeader
            id="roster"
            icon={Users}
            iconTile={palette.emerald.tile}
            title="Roster"
            description={
              subjectName
                ? `${subjectName} · ${attendanceDate.format("MMM D")}`
                : selectedSubject
                  ? "Loading…"
                  : "Select a subject to load students"
            }
            action={
              attendanceData.length > 0 && (
                <Button size="sm" variant="ghost" icon={CheckCheck} onClick={() => markAll(totalPresent !== totalStudents)}>
                  {totalPresent === totalStudents ? "Clear all" : "Mark all present"}
                </Button>
              )
            }
          />
          <div className="mt-4 border-t border-line">
            {!selectedSubject ? (
              <EmptyState icon={BookOpen} title="Choose a subject" description="The class roster loads once you pick a subject above." />
            ) : loading && attendanceData.length === 0 ? (
              <SkeletonTable rows={6} />
            ) : loadError ? (
              <ErrorState title="We couldn't load the roster" onRetry={loadStudents} />
            ) : (
              <DataTable
                caption="Class roster"
                columns={columns}
                rows={attendanceData}
                rowKey="id"
                pageSize={12}
                search={{ placeholder: "Search students", getText: (r) => r.name }}
                mobileRow={(r) => (
                  <div className="flex items-center gap-3">
                    <Avatar name={r.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{r.name}</p>
                      <p className="text-xs text-ink-3">
                        Semester {r.semester ?? "—"}
                        {isRecognized(r.name) && ` · ${(r.confidence * 100).toFixed(0)}% match`}
                      </p>
                    </div>
                    <Switch checked={r.present} onChange={(v) => setPresent(r.id, v)} label={`${r.name} present`} />
                  </div>
                )}
                empty={<EmptyState icon={Users} title="No students yet" description="Students appear here after they sign up." compact />}
              />
            )}
          </div>

          {attendanceData.length > 0 && (
            <div className="glass sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 border-t border-line bg-surface/90 px-4 py-3 backdrop-blur-xl sm:px-5 md:bottom-0">
              <p className="text-[13px] text-ink-2">
                <span className="font-semibold tabular-nums text-ink">{totalPresent}</span> of {totalStudents} present
              </p>
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default AttendanceSheet;
