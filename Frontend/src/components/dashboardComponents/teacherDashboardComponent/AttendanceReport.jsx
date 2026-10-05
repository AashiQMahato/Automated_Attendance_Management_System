import { useEffect, useMemo, useState } from "react";
import { colors as palette } from "../../ui/colors";
import { useSearchParams } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Download,
  Inbox,
  RefreshCw,
  Target,
  TrendingDown,
  PieChart as PieIcon,
  History,
  LineChart,
} from "lucide-react";
import api, { fetchSubjects } from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { ATTENDANCE_THRESHOLD, attendanceStatus, dayjs, downloadCsv, formatPercent, percent, titleCase } from "../../../lib/format";
import { sessionRate } from "../../../lib/attendance";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatCard from "../../ui/StatCard";
import StatusBadge from "../../ui/StatusBadge";
import DataTable from "../../ui/DataTable";
import AsyncContent from "../../ui/AsyncContent";
import { Card, CardBody, CardHeader } from "../../ui/Card";
import { ChartTooltip, LegendDot, chartGradients, useChartTheme } from "../../ui/Chart";
import { EmptyState } from "../../ui/States";
import { SkeletonCard, SkeletonStatGrid } from "../../ui/Skeleton";
import SubjectSelect from "../../dashboard/SubjectSelect";

const ReportSkeleton = () => (
  <div className="space-y-4">
    <SkeletonStatGrid />
    <div className="grid gap-4 lg:grid-cols-3">
      <SkeletonCard chart className="lg:col-span-2" />
      <SkeletonCard chart />
    </div>
  </div>
);

const AttendanceReport = () => {
  const [searchParams] = useSearchParams();
  const { colors, axis, grid, cursor } = useChartTheme();
  const subjectsState = useAsync(fetchSubjects, []);
  const subjects = useMemo(() => subjectsState.data || [], [subjectsState.data]);
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get("subject"));

  // Default to the first subject once the list arrives.
  useEffect(() => {
    if (!selectedSubject && subjects.length) setSelectedSubject(subjects[0]._id);
  }, [subjects, selectedSubject]);

  const report = useAsync(async () => {
    if (!selectedSubject) return [];
    const { data } = await api.get(`/attendance/subject/${selectedSubject}`);
    if (!Array.isArray(data.data)) throw new Error("Attendance records is not an array");
    return data.data;
  }, [selectedSubject]);

  const stats = useMemo(() => {
    const records = [...(report.data || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    const sessions = records.map((r) => ({
      id: r._id,
      date: r.date,
      ...sessionRate(r),
      absent: sessionRate(r).total - sessionRate(r).present,
    }));
    const totalPresent = sessions.reduce((n, s) => n + s.present, 0);
    const totalStudents = sessions.reduce((n, s) => n + s.total, 0);

    // Same rule as before: compare the two halves' average present count.
    let trend = "stable";
    if (sessions.length >= 2) {
      const mid = Math.floor(sessions.length / 2);
      const avg = (arr) => arr.reduce((n, s) => n + s.present, 0) / arr.length;
      const first = avg(sessions.slice(0, mid));
      const second = avg(sessions.slice(mid));
      if (second > first * 1.05) trend = "up";
      else if (second < first * 0.95) trend = "down";
    }
    const best = sessions.reduce((m, s) => (!m || s.present > m.present ? s : m), null);
    const worst = sessions.reduce((m, s) => (!m || s.present < m.present ? s : m), null);
    return {
      sessions,
      chart: sessions.map((s) => ({ ...s, label: dayjs(s.date).format("MMM D"), rate: Math.round(s.rate) })),
      avg: percent(totalPresent, totalStudents),
      totalPresent,
      totalAbsent: totalStudents - totalPresent,
      trend,
      best,
      worst,
    };
  }, [report.data]);

  const subjectName = titleCase(subjects.find((s) => s._id === selectedSubject)?.name);

  const exportCsv = () =>
    downloadCsv(`${(subjectName || "report").replace(/\s+/g, "-").toLowerCase()}-${dayjs().format("YYYY-MM-DD")}.csv`, [
      ["Date", "Present", "Absent", "Total", "Rate %"],
      ...stats.sessions.map((s) => [dayjs(s.date).format("YYYY-MM-DD"), s.present, s.absent, s.total, s.rate.toFixed(1)]),
    ]);

  const pie = [
    { name: "Present", value: stats.totalPresent, color: colors.present, fill: "url(#g-present)" },
    { name: "Absent", value: stats.totalAbsent, color: colors.absent, fill: "url(#g-absent)" },
  ];

  const columns = [
    {
      key: "date",
      header: "Date",
      sortValue: (r) => new Date(r.date).getTime(),
      render: (r) => <span className="font-medium text-ink">{dayjs(r.date).format("ddd, MMM D, YYYY")}</span>,
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
      header: "Rate",
      align: "right",
      sortValue: (r) => r.rate,
      render: (r) => <span className="font-medium tabular-nums text-ink">{formatPercent(r.rate, 0)}</span>,
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

  const loading = subjectsState.loading || report.loading;
  const error = subjectsState.error || report.error;
  const hasData = stats.sessions.length > 0;

  return (
    <div className="space-y-4">
      <PageHeader
        icon={BarChart3}
        color="violet"
        title="Reports"
        description={subjectName ? `Attendance analytics for ${subjectName}` : "Attendance analytics per subject"}
        actions={
          <>
            <div className="w-full sm:w-64">
              <SubjectSelect subjects={subjects} loading={subjectsState.loading} value={selectedSubject} onChange={setSelectedSubject} />
            </div>
            <Button size="icon" icon={RefreshCw} aria-label="Refresh" onClick={() => report.reload()} />
            {hasData && (
              <Button icon={Download} onClick={exportCsv}>
                Export
              </Button>
            )}
          </>
        }
      />

      <AsyncContent
        loading={loading}
        error={error}
        onRetry={() => (subjectsState.error ? subjectsState.reload() : report.reload())}
        loadingLabel="Loading report"
        errorTitle="We couldn't load this report"
        skeleton={<ReportSkeleton />}
      >
        {() =>
          subjects.length === 0 ? (
            <Card>
              <EmptyState
                icon={BarChart3}
                title="No subjects yet"
                description="Create a subject from Overview to start collecting reports."
              />
            </Card>
          ) : !hasData ? (
            <Card>
              <EmptyState
                icon={Inbox}
                title="No attendance recorded"
                description={`Take attendance for ${subjectName || "this subject"} to see analytics here.`}
              />
            </Card>
          ) : (
            <div className="space-y-4">
              <section aria-label="Report summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard
                  label="Classes recorded"
                  color="indigo"
                  index={0}
                  icon={CalendarCheck}
                  value={stats.sessions.length}
                  hint={`Since ${dayjs(stats.sessions[0].date).format("MMM D")}`}
                />
                <StatCard
                  label="Average attendance"
                  color="emerald"
                  index={1}
                  spark={stats.chart.map((c) => c.rate)}
                  icon={Activity}
                  value={formatPercent(stats.avg)}
                  tone={stats.avg < ATTENDANCE_THRESHOLD ? "warning" : "default"}
                  trend={
                    stats.trend === "stable"
                      ? { direction: "flat", label: "Stable" }
                      : { direction: stats.trend, label: stats.trend === "up" ? "Improving" : "Declining" }
                  }
                />
                <StatCard
                  label="Best class"
                  color="amber"
                  index={2}
                  icon={Target}
                  value={stats.best.present}
                  hint={`present · ${dayjs(stats.best.date).format("MMM D")}`}
                />
                <StatCard
                  label="Lowest class"
                  color="rose"
                  index={3}
                  icon={TrendingDown}
                  value={stats.worst.present}
                  hint={`present · ${dayjs(stats.worst.date).format("MMM D")}`}
                />
              </section>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2" aria-labelledby="daily">
                  <CardHeader
                    id="daily"
                    icon={LineChart}
                    iconTile={palette.violet.tile}
                    title="Attendance rate by class"
                    description="Share of students present each class"
                    action={
                      stats.trend !== "stable" && (
                        <StatusBadge
                          tone={stats.trend === "up" ? "success" : "danger"}
                          dot={false}
                          icon={stats.trend === "up" ? ArrowUpRight : ArrowDownRight}
                        >
                          {stats.trend === "up" ? "Improving" : "Declining"}
                        </StatusBadge>
                      )
                    }
                  />
                  <CardBody>
                    <div className="h-[260px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.chart} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                          {chartGradients(colors)}
                          <CartesianGrid {...grid} />
                          <XAxis dataKey="label" {...axis} minTickGap={16} />
                          <YAxis {...axis} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} />
                          <ReferenceLine y={ATTENDANCE_THRESHOLD} stroke={colors.axis} strokeDasharray="3 4" strokeOpacity={0.6} />
                          <Tooltip
                            cursor={{ stroke: colors.neutral }}
                            content={
                              <ChartTooltip formatter={(v, _n, p) => [`${v}% · ${p.payload.present}/${p.payload.total}`, "Present"]} />
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="rate"
                            stroke={colors.primary}
                            strokeWidth={2.5}
                            fill="url(#g-area)"
                            dot={stats.chart.length <= 20 ? { r: 2.5, fill: colors.primary, strokeWidth: 0 } : false}
                            activeDot={{ r: 4 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardBody>
                </Card>

                <Card aria-labelledby="distribution">
                  <CardHeader
                    id="distribution"
                    icon={PieIcon}
                    iconTile={palette.emerald.tile}
                    title="Distribution"
                    description="All check-ins for this subject"
                  />
                  <CardBody>
                    <div className="relative mx-auto h-[190px] max-w-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          {chartGradients(colors)}
                          <Pie
                            data={pie}
                            dataKey="value"
                            nameKey="name"
                            innerRadius="70%"
                            outerRadius="100%"
                            paddingAngle={2}
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {pie.map((p) => (
                              <Cell key={p.name} fill={p.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={
                              <ChartTooltip
                                formatter={(v, n) => [`${v} (${formatPercent(percent(v, stats.totalPresent + stats.totalAbsent), 0)})`, n]}
                              />
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[22px] font-semibold tracking-[-0.02em] tabular-nums text-ink">
                          {formatPercent(stats.avg, 0)}
                        </span>
                        <span className="text-[11px] text-ink-3">present</span>
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                      {pie.map((p) => (
                        <div
                          key={p.name}
                          className={`rounded-xl py-2.5 ${p.name === "Present" ? palette.emerald.soft : palette.rose.soft}`}
                        >
                          <LegendDot color={p.color}>{p.name}</LegendDot>
                          <p className="mt-0.5 text-base font-semibold tabular-nums text-ink">{p.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Card aria-labelledby="present-count">
                <CardHeader id="present-count" icon={BarChart3} iconTile={palette.indigo.tile} title="Students present per class" />
                <CardBody>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chart} margin={{ top: 8, right: 4, bottom: 0, left: -18 }} barCategoryGap="30%">
                        {chartGradients(colors)}
                        <CartesianGrid {...grid} />
                        <XAxis dataKey="label" {...axis} minTickGap={16} />
                        <YAxis {...axis} allowDecimals={false} />
                        <Tooltip
                          cursor={cursor}
                          content={<ChartTooltip formatter={(v, _n, p) => [`${v} of ${p.payload.total}`, "Present"]} />}
                        />
                        <Bar dataKey="present" fill="url(#g-primary)" radius={[8, 8, 3, 3]} maxBarSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card className="overflow-hidden" aria-labelledby="sessions">
                <CardHeader
                  id="sessions"
                  icon={History}
                  iconTile={palette.sky.tile}
                  title="Class history"
                  description={`${stats.sessions.length} classes`}
                />
                <div>
                  <DataTable
                    caption="Class history"
                    columns={columns}
                    rows={stats.sessions}
                    rowKey="id"
                    pageSize={10}
                    initialSort={{ key: "date", dir: "desc" }}
                  />
                </div>
              </Card>
            </div>
          )
        }
      </AsyncContent>
    </div>
  );
};

export default AttendanceReport;
