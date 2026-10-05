import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Inbox,
  Megaphone,
  UserCheck,
  CircleUserRound,
  UserX,
  XCircle,
} from "lucide-react";
import store from "../../../zustand/loginStore";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import {
  ATTENDANCE_THRESHOLD,
  attendanceStatus,
  dayjs,
  downloadCsv,
  dueStatus,
  firstName,
  formatPercent,
  greeting,
  relativeDay,
} from "../../../lib/format";
import { bySubject, monthStats, studentEntries, summarize, thresholdGuidance, trendSeries } from "../../../lib/attendance";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatCard from "../../ui/StatCard";
import StatusBadge from "../../ui/StatusBadge";
import { Card, CardBody, CardHeader } from "../../ui/Card";
import { ProgressBar, ProgressRing } from "../../ui/Progress";
import SegmentedControl from "../../ui/SegmentedControl";
import DataTable from "../../ui/DataTable";
import ActivityTimeline from "../../ui/ActivityTimeline";
import QuickAction from "../../ui/QuickAction";
import { EmptyState, ErrorState } from "../../ui/States";
import { SkeletonCard, SkeletonStatGrid } from "../../ui/Skeleton";
import AsyncContent from "../../ui/AsyncContent";
import AttendanceTrendChart from "../../dashboard/AttendanceTrendChart";

const DateTile = ({ date }) => (
  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface-2/60 leading-none">
    <span className="text-[10px] font-medium uppercase tracking-wide text-ink-3">{dayjs(date).format("MMM")}</span>
    <span className="mt-0.5 text-[15px] font-semibold tabular-nums text-ink">{dayjs(date).format("D")}</span>
  </div>
);

const StudentHomePage = () => {
  const navigate = useNavigate();
  const { loginUserData } = store((state) => state);
  const studentId = loginUserData?._id;
  const { loading, error, data, reload } = useAsync(async () => {
    const [subjects, attendance, assignments, holidays] = await Promise.allSettled([
      fetchSubjects(),
      api.get("/attendance/student"),
      api.get("/assignments"),
      api.get("/holidays"),
    ]);
    // Attendance is the core of this page; the rest degrade per section.
    if (attendance.status === "rejected") throw attendance.reason;
    return {
      subjects: subjects.status === "fulfilled" ? subjects.value : [],
      records: attendance.value.data || [],
      assignments: assignments.status === "fulfilled" ? assignments.value.data?.data || [] : null,
      holidays: holidays.status === "fulfilled" ? holidays.value.data?.data || [] : null,
    };
  }, [studentId]);
  const [range, setRange] = useState("week");

  const derived = useMemo(() => {
    if (!data) return null;
    const entries = studentEntries(data.records, studentId).sort((a, b) => new Date(b.date) - new Date(a.date));
    const overall = summarize(entries);
    const thisMonth = monthStats(entries, 0);
    const lastMonth = monthStats(entries, 1);
    const subjectsRows = bySubject(entries, data.subjects).sort((a, b) => a.name.localeCompare(b.name));

    const today = dayjs().startOf("day");
    const upcoming = [
      ...(data.assignments || [])
        .filter((a) => !dayjs(a.dueDate).isBefore(today) && !a.submissions?.some((s) => s.student === studentId))
        .map((a) => ({ id: a._id, kind: "assignment", date: a.dueDate, title: a.title, meta: a.subject?.name })),
      ...(data.holidays || [])
        .filter((h) => !dayjs(h.endDate).isBefore(today))
        .map((h) => ({
          id: h._id,
          kind: "holiday",
          date: h.startDate,
          title: h.title,
          meta: `${dayjs(h.endDate).diff(h.startDate, "day") + 1} days`,
        })),
    ]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    const activity = [
      ...entries.slice(0, 8).map((e) => ({
        id: `att-${e.id}`,
        at: e.date,
        icon: e.status === "present" ? CheckCircle2 : XCircle,
        tone: e.status === "present" ? "success" : "danger",
        title: e.status === "present" ? `Marked present in ${e.subject}` : `Missed ${e.subject}`,
      })),
      ...(data.assignments || []).slice(0, 5).map((a) => ({
        id: `asg-${a._id}`,
        at: a.createdAt,
        icon: FileText,
        tone: "info",
        title: `New assignment: ${a.title}`,
        meta: a.subject?.name,
      })),
      ...(data.holidays || []).slice(0, 5).map((h) => ({
        id: `hol-${h._id}`,
        at: h.createdAt,
        icon: Megaphone,
        tone: "neutral",
        title: `Holiday announced: ${h.title}`,
      })),
    ]
      .filter((a) => a.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 6)
      .map((a) => ({ ...a, time: dayjs(a.at).fromNow(), dateTime: dayjs(a.at).toISOString() }));

    return { entries, overall, thisMonth, lastMonth, subjectsRows, upcoming, activity };
  }, [data, studentId]);

  const series = useMemo(() => (derived ? trendSeries(derived.entries, range, range === "month" ? 6 : 8) : []), [derived, range]);

  const exportReport = () => {
    const rows = [["Date", "Subject", "Status"], ...derived.entries.map((e) => [dayjs(e.date).format("YYYY-MM-DD"), e.subject, e.status])];
    downloadCsv(`attendance-${dayjs().format("YYYY-MM-DD")}.csv`, rows);
  };

  const header = (
    <PageHeader
      title={`${greeting()}, ${firstName(loginUserData?.fullName)}`}
      description="Here's your academic overview."
      meta={
        <>
          {loginUserData?.semester && <StatusBadge tone="accent">Semester {loginUserData.semester}</StatusBadge>}
          {derived && (
            <>
              <StatusBadge tone="neutral" dot={false} icon={BookOpen}>
                {derived.subjectsRows.length} {derived.subjectsRows.length === 1 ? "subject" : "subjects"}
              </StatusBadge>
              {derived.overall.total > 0 && (
                <StatusBadge tone={attendanceStatus(derived.overall.rate).tone}>{attendanceStatus(derived.overall.rate).label}</StatusBadge>
              )}
            </>
          )}
        </>
      }
      actions={
        derived?.entries.length > 0 && (
          <Button icon={Download} onClick={exportReport}>
            Download report
          </Button>
        )
      }
    />
  );

  const skeleton = (
    <div className="space-y-6">
      <SkeletonStatGrid />
      <div className="grid gap-6 lg:grid-cols-3">
        <SkeletonCard chart className="lg:col-span-2" />
        <SkeletonCard lines={4} />
      </div>
    </div>
  );

  if (loading || error) {
    return (
      <div className="space-y-6">
        {header}
        <AsyncContent
          loading={loading}
          error={error}
          onRetry={reload}
          skeleton={skeleton}
          loadingLabel="Loading your overview"
          errorTitle="We couldn't load your attendance"
        />
      </div>
    );
  }

  const { overall, thisMonth, lastMonth, subjectsRows, upcoming, activity } = derived;
  const hasData = overall.total > 0;
  const status = attendanceStatus(overall.rate, hasData);
  const delta = thisMonth.total && lastMonth.total ? thisMonth.rate - lastMonth.rate : null;
  const guidance = thresholdGuidance(overall);

  const subjectColumns = [
    {
      key: "name",
      header: "Subject",
      sortValue: (r) => r.name.toLowerCase(),
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{r.name}</p>
          {r.code && <p className="text-xs text-ink-3">{r.code}</p>}
        </div>
      ),
    },
    {
      key: "present",
      header: "Present",
      align: "right",
      sortValue: (r) => r.present,
      render: (r) => <span className="tabular-nums">{r.present}</span>,
    },
    {
      key: "absent",
      header: "Absent",
      align: "right",
      sortValue: (r) => r.absent,
      render: (r) => <span className="tabular-nums">{r.absent}</span>,
    },
    {
      key: "rate",
      header: "Attendance",
      sortValue: (r) => (r.total ? r.rate : -1),
      className: "md:w-[200px]",
      render: (r) =>
        r.total ? (
          <div className="flex items-center gap-3">
            <ProgressBar value={r.rate} tone={attendanceStatus(r.rate).tone} label={`${r.name} attendance`} className="hidden md:block" />
            <span className="w-12 shrink-0 text-right font-medium tabular-nums text-ink">{formatPercent(r.rate, 0)}</span>
          </div>
        ) : (
          <span className="text-ink-3">—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const s = attendanceStatus(r.rate, r.total > 0);
        return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {header}

      <section aria-label="Attendance summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Overall attendance"
          icon={UserCheck}
          value={hasData ? formatPercent(overall.rate) : "—"}
          tone={hasData ? (status.tone === "success" ? "default" : status.tone) : "default"}
          hint={
            hasData
              ? `${overall.rate >= ATTENDANCE_THRESHOLD ? "Above" : "Below"} the ${ATTENDANCE_THRESHOLD}% minimum`
              : "No classes recorded yet"
          }
        />
        <StatCard
          label="Classes attended"
          icon={CalendarCheck}
          value={overall.present}
          hint={hasData ? `of ${overall.total} classes` : "—"}
        />
        <StatCard
          label="Classes missed"
          icon={UserX}
          value={overall.absent}
          tone={overall.absent > 0 && status.tone !== "success" ? status.tone : "default"}
          hint={`${thisMonth.absent} this month`}
        />
        <StatCard
          label="This month"
          icon={CalendarDays}
          value={thisMonth.total ? formatPercent(thisMonth.rate) : "—"}
          hint={thisMonth.total ? `${thisMonth.present}/${thisMonth.total} classes` : "No classes yet"}
          trend={
            delta === null
              ? undefined
              : {
                  direction: Math.abs(delta) < 0.05 ? "flat" : delta > 0 ? "up" : "down",
                  label: `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pts`,
                }
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" aria-labelledby="att-trend">
          <CardHeader
            id="att-trend"
            title="Attendance trend"
            description={range === "week" ? "Last 8 weeks" : "Last 6 months"}
            action={
              <SegmentedControl
                label="Trend range"
                value={range}
                onChange={setRange}
                options={[
                  { value: "week", label: "Weekly" },
                  { value: "month", label: "Monthly" },
                ]}
              />
            }
          />
          {hasData ? (
            <CardBody className="grid gap-6 md:grid-cols-[auto,1fr] md:items-center">
              <div className="flex items-center gap-5 md:flex-col md:items-start md:gap-4">
                <ProgressRing
                  value={overall.rate}
                  size={116}
                  stroke={10}
                  tone={status.tone}
                  label={`Overall attendance ${formatPercent(overall.rate)}`}
                >
                  <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                    {formatPercent(overall.rate, 0)}
                  </span>
                  <span className="text-[11px] text-ink-3">overall</span>
                </ProgressRing>
                <ul className="space-y-1.5 text-[13px] text-ink-2 md:max-w-[180px]">
                  <li>
                    {thisMonth.absent === 0
                      ? "No classes missed this month"
                      : `${thisMonth.absent} ${thisMonth.absent === 1 ? "class" : "classes"} missed this month`}
                  </li>
                  {delta !== null && Math.abs(delta) >= 0.05 && (
                    <li>
                      Attendance {delta > 0 ? "improved" : "dropped"}{" "}
                      <span className={delta > 0 ? "text-success" : "text-danger"}>{Math.abs(delta).toFixed(1)}%</span> from last month
                    </li>
                  )}
                  {guidance && (
                    <li className="text-ink-3">
                      {guidance.kind === "buffer"
                        ? guidance.count > 0
                          ? `You can miss ${guidance.count} more ${guidance.count === 1 ? "class" : "classes"} and stay above ${ATTENDANCE_THRESHOLD}%`
                          : `You're right at the ${ATTENDANCE_THRESHOLD}% minimum`
                        : `Attend the next ${guidance.count} ${guidance.count === 1 ? "class" : "classes"} to reach ${ATTENDANCE_THRESHOLD}%`}
                    </li>
                  )}
                </ul>
              </div>
              <div className="min-w-0">
                <AttendanceTrendChart data={series} />
                <p className="mt-2 text-xs text-ink-3">Dashed line marks the {ATTENDANCE_THRESHOLD}% minimum.</p>
              </div>
            </CardBody>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No attendance records yet"
              description="Your attendance will appear here once your teachers start recording classes."
            />
          )}
        </Card>

        <Card aria-labelledby="upcoming">
          <CardHeader id="upcoming" title="Upcoming" description="Deadlines and holidays" />
          <div className="px-2 pb-3 pt-2">
            {data.assignments === null && data.holidays === null ? (
              <ErrorState compact onRetry={reload} />
            ) : upcoming.length === 0 ? (
              <EmptyState icon={CalendarDays} title="Nothing coming up" description="New deadlines and holidays will show here." compact />
            ) : (
              <ul>
                {upcoming.map((item) => {
                  return (
                    <li key={`${item.kind}-${item.id}`}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(item.kind === "assignment" ? "/studentdashboard/assignments" : "/studentdashboard/holidays")
                        }
                        className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
                      >
                        <DateTile date={item.date} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-ink">{item.title}</p>
                          <p className="truncate text-xs text-ink-3">
                            {item.kind === "assignment" ? "Assignment" : "Holiday"}
                            {item.meta ? ` · ${item.meta}` : ""}
                          </p>
                        </div>
                        {item.kind === "assignment" ? (
                          <StatusBadge tone={dueStatus(item.date).tone}>{dueStatus(item.date).label}</StatusBadge>
                        ) : (
                          <StatusBadge tone="info" dot={false} icon={CalendarRange}>
                            {relativeDay(item.date)}
                          </StatusBadge>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2" aria-labelledby="by-subject">
          <CardHeader
            id="by-subject"
            title="Attendance by subject"
            description={`Minimum required: ${ATTENDANCE_THRESHOLD}%`}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate("/studentdashboard/attendance")}>
                View all
              </Button>
            }
          />
          <div className="mt-4 border-t border-line">
            <DataTable
              caption="Attendance by subject"
              columns={subjectColumns}
              rows={subjectsRows}
              rowKey="id"
              pageSize={8}
              empty={
                <EmptyState
                  icon={BookOpen}
                  title="No subjects yet"
                  description="Subjects appear here once a teacher adds them for your semester."
                  compact
                />
              }
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card aria-labelledby="activity">
            <CardHeader id="activity" title="Recent activity" />
            <CardBody>
              {activity.length === 0 ? (
                <EmptyState icon={Inbox} title="No activity yet" compact className="!py-4" />
              ) : (
                <ActivityTimeline items={activity} />
              )}
            </CardBody>
          </Card>

          <Card aria-labelledby="quick-actions">
            <CardHeader id="quick-actions" title="Quick actions" />
            <div className="space-y-1 p-3">
              <QuickAction
                primary
                icon={UserCheck}
                title="View attendance"
                description="Every class, every subject"
                onClick={() => navigate("/studentdashboard/attendance")}
              />
              <QuickAction
                icon={ClipboardList}
                title="Assignments"
                description="Due dates and submissions"
                onClick={() => navigate("/studentdashboard/assignments")}
              />
              <QuickAction
                icon={CalendarDays}
                title="Academic calendar"
                description="Events and important dates"
                onClick={() => navigate("/studentdashboard/calendar")}
              />
              <QuickAction
                icon={CircleUserRound}
                title="Profile"
                description="Your account details"
                onClick={() => navigate("/studentdashboard/settings")}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;
