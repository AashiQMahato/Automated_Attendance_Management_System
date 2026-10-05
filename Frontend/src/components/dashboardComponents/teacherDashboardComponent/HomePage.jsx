import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  Zap,
  BarChart3,
  BookOpen,
  CalendarCheck,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Inbox,
  ScanFace,
  ShieldCheck,
  Users,
} from "lucide-react";
import store from "../../../zustand/loginStore";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { ATTENDANCE_THRESHOLD, attendanceStatus, dayjs, firstName, formatPercent, greeting, percent, titleCase } from "../../../lib/format";
import { sessionRate, studentRatesFromSessions, trendSeries } from "../../../lib/attendance";
import HeroBanner, { HeroChip } from "../../ui/HeroBanner";
import { colorFor, colors as palette } from "../../ui/colors";
import Button from "../../ui/Button";
import StatCard from "../../ui/StatCard";
import StatusBadge from "../../ui/StatusBadge";
import Avatar from "../../ui/Avatar";
import SegmentedControl from "../../ui/SegmentedControl";
import QuickAction from "../../ui/QuickAction";
import { Card, CardBody, CardHeader } from "../../ui/Card";
import { ProgressBar, ProgressRing } from "../../ui/Progress";
import { ChartTooltip, chartGradients, useChartTheme } from "../../ui/Chart";
import { EmptyState } from "../../ui/States";
import { SkeletonCard, SkeletonStatGrid } from "../../ui/Skeleton";
import AsyncContent from "../../ui/AsyncContent";
import AttendanceTrendChart from "../../dashboard/AttendanceTrendChart";
import SidePanel, { PanelSection } from "../../ui/SidePanel";
import SubjectSetup from "./SubjectSetup";

const HomePage = () => {
  const navigate = useNavigate();
  const { loginUserData } = store((state) => state);
  const { loading, error, data, reload } = useAsync(async () => {
    const [subjects, studentsRes] = await Promise.all([fetchSubjects(), api.get("/users/students")]);
    const sessionLists = await Promise.all(
      subjects.map((subject) =>
        api
          .get(`/attendance/subject/${subject._id}`)
          .then(({ data: res }) => (res.data || []).map((s) => ({ ...s, subjectId: subject._id })))
          .catch(() => []),
      ),
    );
    return { subjects, students: studentsRes.data.data || [], sessions: sessionLists.flat() };
  }, []);
  const { colors, axis, grid, cursor } = useChartTheme();
  const [view, setView] = useState("trend");
  const [studentDetail, setStudentDetail] = useState(null);
  const [showAllLow, setShowAllLow] = useState(false);

  const derived = useMemo(() => {
    if (!data) return null;
    const { students, sessions } = data;
    const subjects = data.subjects.map((sub) => ({ ...sub, name: titleCase(sub.name) }));
    const subjectById = new Map(subjects.map((s) => [s._id, s]));
    const studentById = new Map(students.map((s) => [s._id, s]));
    const today = dayjs();

    const totals = sessions.reduce(
      (acc, s) => {
        const r = sessionRate(s);
        acc.present += r.present;
        acc.total += r.total;
        return acc;
      },
      { present: 0, total: 0 },
    );

    const classes = subjects
      .map((subject) => {
        const list = sessions.filter((s) => s.subjectId === subject._id);
        const present = list.reduce((n, s) => n + sessionRate(s).present, 0);
        const total = list.reduce((n, s) => n + sessionRate(s).total, 0);
        const todaySession = list.find((s) => dayjs(s.date).isSame(today, "day"));
        return {
          ...subject,
          sessions: list.length,
          rate: percent(present, total),
          hasData: total > 0,
          today: todaySession ? sessionRate(todaySession) : null,
        };
      })
      .sort((a, b) => (a.today ? 1 : 0) - (b.today ? 1 : 0) || a.name.localeCompare(b.name));

    const rates = studentRatesFromSessions(sessions);
    const lowAttendance = [...rates.values()]
      .filter((r) => r.total > 0 && percent(r.present, r.total) < ATTENDANCE_THRESHOLD)
      .map((r) => {
        const student = studentById.get(r.id);
        return {
          ...r,
          rate: percent(r.present, r.total),
          name: student?.fullName || "Former student",
          semester: student?.semester,
          email: student?.email,
          breakdown: [...r.bySubject.entries()].map(([subjectId, v]) => ({
            subject: subjectById.get(subjectId)?.name || "Subject",
            ...v,
            rate: percent(v.present, v.total),
          })),
        };
      })
      .sort((a, b) => a.rate - b.rate);

    const entries = sessions.flatMap((s) => (s.students || []).map((st) => ({ date: s.date, status: st.status })));
    const trend = trendSeries(entries, "week", 8);
    const bySubject = classes
      .filter((c) => c.hasData)
      .map((c) => ({ id: c._id, name: c.code || c.name, full: c.name, rate: Math.round(c.rate * 10) / 10 }));

    const semesters = [...new Set(subjects.map((s) => s.semester).filter(Boolean))].sort((a, b) => a - b);
    const sessionsToday = classes.filter((c) => c.today).length;

    return { totals, classes, lowAttendance, trend, bySubject, semesters, sessionsToday, studentCount: students.length };
  }, [data]);

  const takeAttendance = (subjectId) =>
    navigate(subjectId ? `/teacherdashboard/attendance?subject=${subjectId}` : "/teacherdashboard/attendance");

  const header = (
    <HeroBanner
      eyebrow={dayjs().format("dddd, MMMM D")}
      title={`${greeting()}, ${firstName(loginUserData?.fullName)}`}
      description="Here's your teaching overview."
      chips={
        derived && (
          <>
            <HeroChip icon={BookOpen}>
              {derived.classes.length} {derived.classes.length === 1 ? "subject" : "subjects"}
            </HeroChip>
            {derived.semesters.length > 0 && (
              <HeroChip icon={GraduationCap}>
                {derived.semesters.length === 1 ? "Semester" : "Semesters"} {derived.semesters.join(", ")}
              </HeroChip>
            )}
            <HeroChip icon={Users}>{derived.studentCount} students</HeroChip>
          </>
        )
      }
      actions={
        <>
          <Button variant="white" icon={ScanFace} onClick={() => takeAttendance()}>
            Take attendance
          </Button>
          <Button variant="glass" icon={BarChart3} onClick={() => navigate("/teacherdashboard/reports")}>
            Reports
          </Button>
        </>
      }
      aside={
        derived?.classes.length > 0 && (
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/20 backdrop-blur lg:flex-col lg:px-6 lg:py-5">
            <ProgressRing
              value={(derived.sessionsToday / derived.classes.length) * 100}
              size={104}
              stroke={9}
              tone="white"
              trackClass="stroke-white/20"
              label={`${derived.sessionsToday} of ${derived.classes.length} classes recorded today`}
            >
              <span className="text-[22px] font-bold tracking-[-0.02em] tabular-nums">
                {derived.sessionsToday}/{derived.classes.length}
              </span>
              <span className="text-[11px] text-white/75">today</span>
            </ProgressRing>
            <p className="max-w-[140px] text-[13px] text-white/85 lg:text-center">
              {derived.sessionsToday === derived.classes.length ? "All classes recorded" : "classes recorded today"}
            </p>
          </div>
        )
      }
    />
  );

  if (loading || error) {
    return (
      <div className="space-y-4">
        {header}
        <AsyncContent
          loading={loading}
          error={error}
          onRetry={reload}
          loadingLabel="Loading your overview"
          errorTitle="We couldn't load your overview"
          skeleton={
            <div className="space-y-4">
              <SkeletonStatGrid />
              <div className="grid gap-4 lg:grid-cols-3">
                <SkeletonCard lines={4} className="lg:col-span-2" />
                <SkeletonCard lines={4} />
              </div>
            </div>
          }
        />
      </div>
    );
  }

  if (data.subjects.length === 0) {
    return <SubjectSetup onSubjectCreated={() => reload()} />;
  }

  const { totals, classes, lowAttendance, trend, bySubject, sessionsToday, studentCount } = derived;
  const overallRate = percent(totals.present, totals.total);
  const nextClassId = classes.find((c) => !c.today)?._id;

  return (
    <div className="space-y-4">
      {header}

      <section aria-label="Teaching summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total students" icon={Users} color="indigo" index={0} value={studentCount} hint="Enrolled across semesters" />
        <StatCard
          label="Average attendance"
          icon={CheckCircle2}
          color="emerald"
          index={1}
          spark={trend.map((t) => t.rate)}
          value={totals.total ? formatPercent(overallRate) : "—"}
          tone={totals.total && overallRate < ATTENDANCE_THRESHOLD ? "warning" : "default"}
          hint={totals.total ? "All recorded classes" : "No classes recorded yet"}
        />
        <StatCard
          label="Recorded today"
          icon={CalendarCheck}
          color="sky"
          index={2}
          value={`${sessionsToday}/${classes.length}`}
          hint={sessionsToday === classes.length ? "All classes done" : `${classes.length - sessionsToday} pending`}
        />
        <StatCard
          label="Low attendance"
          icon={AlertTriangle}
          color="amber"
          index={3}
          value={lowAttendance.length}
          tone={lowAttendance.length ? "warning" : "default"}
          hint={`Below ${ATTENDANCE_THRESHOLD}%`}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" aria-labelledby="classes">
          <CardHeader
            id="classes"
            icon={BookOpen}
            iconTile={palette.indigo.tile}
            title="Your classes"
            description={`Today, ${dayjs().format("dddd, MMMM D")}`}
          />
          <ul className="mt-3 space-y-1 px-2 pb-2">
            {classes.map((c) => {
              const isNext = c._id === nextClassId;
              const status = attendanceStatus(c.rate, c.hasData);
              return (
                <li
                  key={c._id}
                  className={`flex flex-col gap-3 rounded-xl px-3 py-3 transition-colors sm:flex-row sm:items-center ${
                    isNext
                      ? "bg-gradient-to-r from-indigo-50 to-violet-50/40 ring-1 ring-inset ring-indigo-200 dark:from-indigo-500/10 dark:to-transparent dark:ring-indigo-500/30"
                      : "hover:bg-surface-2/70"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${palette[colorFor(c._id)].tile}`}
                    >
                      {(c.code || c.name).slice(0, 2).toUpperCase()}
                      {c.today && (
                        <CheckCircle2
                          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-surface text-emerald-500"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium text-ink">
                        {c.name}
                        {isNext && (
                          <span className="bg-brand-gradient rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Up next
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-ink-3">
                        {c.code} · Semester {c.semester} · {c.sessions} {c.sessions === 1 ? "class" : "classes"} recorded
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-12 sm:pl-0">
                    <div className="w-28">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-ink-3">Avg</span>
                        <span className="font-medium tabular-nums text-ink">{c.hasData ? formatPercent(c.rate, 0) : "—"}</span>
                      </div>
                      <ProgressBar value={c.hasData ? c.rate : 0} tone={status.tone} label={`${c.name} average attendance`} />
                    </div>
                    {c.today ? (
                      <StatusBadge tone="success" className="ml-auto sm:ml-0 sm:w-[156px] sm:justify-center">
                        Done · {c.today.present}/{c.today.total}
                      </StatusBadge>
                    ) : (
                      <Button
                        size="sm"
                        variant={isNext ? "primary" : "secondary"}
                        icon={ScanFace}
                        onClick={() => takeAttendance(c._id)}
                        className="ml-auto sm:ml-0 sm:w-[156px]"
                      >
                        Take attendance
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card aria-labelledby="quick-actions">
          <CardHeader id="quick-actions" icon={Zap} iconTile={palette.violet.tile} title="Quick actions" />
          <div className="space-y-1 p-3">
            <QuickAction
              primary
              icon={ScanFace}
              title="Take attendance"
              description="Photo recognition or manual"
              onClick={() => takeAttendance(nextClassId)}
            />
            <QuickAction
              icon={BarChart3}
              color="violet"
              title="Reports"
              description="Trends and distributions"
              onClick={() => navigate("/teacherdashboard/reports")}
            />
            <QuickAction
              icon={ClipboardList}
              color="amber"
              title="Assignments"
              description="Create and manage work"
              onClick={() => navigate("/teacherdashboard/assignment")}
            />
            <QuickAction
              icon={CalendarRange}
              color="rose"
              title="Announce a holiday"
              description="Notify all students"
              onClick={() => navigate("/teacherdashboard/holiday-annoucement")}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" aria-labelledby="overview">
          <CardHeader
            id="overview"
            icon={TrendingUp}
            iconTile={palette.emerald.tile}
            title="Attendance overview"
            description={view === "trend" ? "Weekly average, last 8 weeks" : "Average per subject"}
            action={
              <SegmentedControl
                label="Chart view"
                value={view}
                onChange={setView}
                options={[
                  { value: "trend", label: "Trend" },
                  { value: "subject", label: "By subject" },
                ]}
              />
            }
          />
          {totals.total === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No attendance recorded yet"
              description="Take attendance for a class to start seeing trends."
              action={
                <Button variant="primary" size="sm" icon={ScanFace} onClick={() => takeAttendance(nextClassId)}>
                  Take attendance
                </Button>
              }
            />
          ) : (
            <CardBody>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-brand-gradient text-[30px] font-bold leading-none tracking-[-0.03em] tabular-nums">
                  {formatPercent(overallRate)}
                </span>
                <span className="text-[13px] text-ink-3">overall · {totals.total} student check-ins</span>
              </div>
              {view === "trend" ? (
                <AttendanceTrendChart data={trend} height={240} />
              ) : (
                <div style={{ height: Math.max(160, bySubject.length * 44 + 30) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bySubject} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap="30%">
                      {chartGradients(
                        colors,
                        bySubject.map((d) => [palette[colorFor(d.id)].hex, palette[colorFor(d.id)].hex2]),
                      )}
                      <CartesianGrid stroke={grid.stroke} horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} {...axis} tickFormatter={(v) => `${v}%`} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        {...axis}
                        width={88}
                        tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 11)}…` : v)}
                      />
                      <ReferenceLine x={ATTENDANCE_THRESHOLD} stroke={colors.axis} strokeDasharray="3 4" strokeOpacity={0.6} />
                      <Tooltip
                        cursor={cursor}
                        content={<ChartTooltip labelFormatter={(_l, p) => p?.[0]?.payload.full} formatter={(v) => [`${v}%`, "Average"]} />}
                      />
                      <Bar dataKey="rate" radius={[3, 8, 8, 3]} maxBarSize={22}>
                        {bySubject.map((d) => (
                          <Cell key={d.full} fill={`url(#g-${palette[colorFor(d.id)].hex.slice(1)})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardBody>
          )}
        </Card>

        <Card aria-labelledby="attention">
          <CardHeader
            id="attention"
            icon={AlertTriangle}
            iconTile={palette.amber.tile}
            title="Needs attention"
            description={`Students below ${ATTENDANCE_THRESHOLD}%`}
            action={lowAttendance.length > 0 && <StatusBadge tone="warning">{lowAttendance.length}</StatusBadge>}
          />
          {lowAttendance.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="No students need attention"
              description={
                totals.total ? `Everyone is at or above ${ATTENDANCE_THRESHOLD}%.` : "This will update once attendance is recorded."
              }
              compact
            />
          ) : (
            <ul className="mt-3 px-2 pb-2">
              {lowAttendance.slice(0, showAllLow ? undefined : 5).map((s) => {
                const status = attendanceStatus(s.rate);
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setStudentDetail(s)}
                      className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2"
                      aria-label={`View ${s.name}, ${formatPercent(s.rate, 0)} attendance`}
                    >
                      <Avatar name={s.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{s.name}</p>
                        <p className="truncate text-xs text-ink-3">
                          {s.semester ? `Semester ${s.semester} · ` : ""}
                          {s.present}/{s.total} classes
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold tabular-nums ${status.tone === "danger" ? "text-danger" : "text-warning"}`}>
                          {formatPercent(s.rate, 0)}
                        </p>
                        <p className="text-[11px] text-ink-3">{status.label}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
              {lowAttendance.length > 5 && (
                <li className="px-1 pt-1">
                  <Button size="sm" variant="ghost" className="w-full" onClick={() => setShowAllLow((v) => !v)} aria-expanded={showAllLow}>
                    {showAllLow ? "Show fewer" : `Show all ${lowAttendance.length}`}
                  </Button>
                </li>
              )}
            </ul>
          )}
        </Card>
      </div>

      <SidePanel
        open={!!studentDetail}
        onClose={() => setStudentDetail(null)}
        label={studentDetail?.name}
        width={440}
        accent="from-amber-50 via-white/40 to-transparent"
        header={
          studentDetail && (
            <div className="flex items-center gap-4">
              <Avatar name={studentDetail.name} size="lg" className="!h-14 !w-14 !text-base" />
              <div className="min-w-0">
                <h2 className="truncate text-[20px] font-bold tracking-[-0.025em] text-ink">{studentDetail.name}</h2>
                <p className="truncate text-[13px] text-ink-3">{studentDetail.email}</p>
                {studentDetail.semester && (
                  <span className="mt-1.5 inline-flex rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-ink-2 ring-1 ring-line">
                    Semester {studentDetail.semester}
                  </span>
                )}
              </div>
            </div>
          )
        }
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setStudentDetail(null)}>Close</Button>
          </div>
        }
      >
        {studentDetail && (
          <>
            <div
              className={`flex items-center gap-4 rounded-2xl p-4 ${palette[attendanceStatus(studentDetail.rate).tone === "danger" ? "rose" : "amber"].soft}`}
            >
              <ProgressRing
                value={studentDetail.rate}
                size={76}
                stroke={7}
                tone={attendanceStatus(studentDetail.rate).tone}
                label={`Attendance ${formatPercent(studentDetail.rate)}`}
              >
                <span className="text-sm font-bold tabular-nums text-ink">{formatPercent(studentDetail.rate, 0)}</span>
              </ProgressRing>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">Attendance in your classes</p>
                <p className="mt-1 text-[15px] font-semibold text-ink">
                  {studentDetail.present} of {studentDetail.total} classes
                </p>
                <StatusBadge tone={attendanceStatus(studentDetail.rate).tone} className="mt-1.5">
                  {attendanceStatus(studentDetail.rate).label}
                </StatusBadge>
              </div>
            </div>
            <PanelSection title="By subject">
              <ul className="space-y-2">
                {studentDetail.breakdown.map((b) => (
                  <li key={b.subject} className="rounded-xl border border-line p-3.5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-[13px] font-medium text-ink">{b.subject}</span>
                      <span className="shrink-0 text-[13px] tabular-nums text-ink-2">
                        {b.present}/{b.total} · <span className="font-semibold text-ink">{formatPercent(b.rate, 0)}</span>
                      </span>
                    </div>
                    <ProgressBar value={b.rate} tone={attendanceStatus(b.rate).tone} label={`${b.subject} attendance`} />
                  </li>
                ))}
              </ul>
            </PanelSection>
          </>
        )}
      </SidePanel>
    </div>
  );
};

export default HomePage;
