import { useMemo, useState } from "react";
import { colors as palette } from "../../ui/colors";
import {
  CalendarCheck,
  CheckCircle2,
  Download,
  Inbox,
  ListChecks,
  Percent,
  UserX,
  XCircle,
  UserCheck,
  BarChart3,
  ListOrdered,
} from "lucide-react";
import store from "../../../zustand/loginStore";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { ATTENDANCE_THRESHOLD, attendanceStatus, dayjs, downloadCsv, formatPercent } from "../../../lib/format";
import AttendanceRing from "../../ui/AttendanceRing";
import { bySubject, studentEntries, summarize, thresholdGuidance } from "../../../lib/attendance";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import StatCard from "../../ui/StatCard";
import StatusBadge from "../../ui/StatusBadge";
import SegmentedControl from "../../ui/SegmentedControl";
import DataTable from "../../ui/DataTable";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import { SkeletonCard, SkeletonStatGrid, SkeletonTable } from "../../ui/Skeleton";
import AsyncContent from "../../ui/AsyncContent";

const StudentAttendance = () => {
  const { loginUserData } = store((state) => state);
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: records, loading, error, reload } = useAsync(() => api.get("/attendance/student").then(({ data }) => data || []), []);

  const entries = useMemo(() => (records ? studentEntries(records, loginUserData._id) : []), [records, loginUserData._id]);
  const stats = useMemo(() => summarize(entries), [entries]);
  const subjectStats = useMemo(() => bySubject(entries).sort((a, b) => a.name.localeCompare(b.name)), [entries]);
  const visible = useMemo(
    () => (statusFilter === "all" ? entries : entries.filter((e) => e.status === statusFilter)),
    [entries, statusFilter],
  );

  const exportCsv = () =>
    downloadCsv(`attendance-${dayjs().format("YYYY-MM-DD")}.csv`, [
      ["Date", "Subject", "Status", "Recorded at"],
      ...entries.map((e) => [
        dayjs(e.date).format("YYYY-MM-DD"),
        e.subject,
        e.status,
        e.timestamp ? dayjs(e.timestamp).format("YYYY-MM-DD HH:mm") : "",
      ]),
    ]);

  const header = (
    <PageHeader
      icon={UserCheck}
      color="emerald"
      title="Attendance"
      description="Every class you've been marked for, across all subjects."
      actions={
        entries.length > 0 && (
          <Button icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
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
          loadingLabel="Loading attendance"
          errorTitle="We couldn't load your attendance"
          skeleton={
            <div className="space-y-4">
              <SkeletonStatGrid />
              <SkeletonCard chart />
              <Card className="overflow-hidden">
                <SkeletonTable />
              </Card>
            </div>
          }
        />
      </div>
    );
  }

  const status = attendanceStatus(stats.rate, stats.total > 0);

  const columns = [
    {
      key: "date",
      header: "Date",
      sortValue: (r) => new Date(r.date).getTime(),
      render: (r) => (
        <div>
          <p className="font-medium text-ink">{dayjs(r.date).format("ddd, MMM D, YYYY")}</p>
          <p className="text-xs text-ink-3 md:hidden">{r.subject}</p>
        </div>
      ),
    },
    { key: "subject", header: "Subject", hideOnMobile: true, render: (r) => <span className="text-ink">{r.subject}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.status === "present" ? (
          <StatusBadge tone="success" dot={false} icon={CheckCircle2}>
            Present
          </StatusBadge>
        ) : (
          <StatusBadge tone="danger" dot={false} icon={XCircle}>
            Absent
          </StatusBadge>
        ),
    },
    {
      key: "timestamp",
      header: "Recorded",
      render: (r) => <span className="tabular-nums text-ink-3">{r.timestamp ? dayjs(r.timestamp).format("MMM D, HH:mm") : "—"}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      {header}

      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total classes" icon={ListChecks} color="indigo" index={0} value={stats.total} hint="Recorded so far" />
        <StatCard
          label="Present"
          color="emerald"
          index={1}
          icon={CalendarCheck}
          value={stats.present}
          hint={stats.total ? `${formatPercent(stats.rate, 0)} of classes` : "—"}
        />
        <StatCard
          label="Absent"
          color="rose"
          index={2}
          icon={UserX}
          value={stats.absent}
          tone={stats.absent && status.tone !== "success" ? status.tone : "default"}
          hint={stats.total ? `${formatPercent(100 - stats.rate, 0)} of classes` : "—"}
        />
        <StatCard
          label="Attendance rate"
          color="violet"
          index={3}
          icon={Percent}
          value={stats.total ? formatPercent(stats.rate) : "—"}
          tone={status.tone === "warning" || status.tone === "danger" ? status.tone : "default"}
          hint={status.label}
        />
      </section>

      <Card aria-labelledby="by-subject-chart">
        <CardHeader
          id="by-subject-chart"
          icon={BarChart3}
          iconTile={palette.emerald.tile}
          title="By subject"
          description={`Your standing per subject · minimum ${ATTENDANCE_THRESHOLD}%`}
        />
        {subjectStats.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No attendance records yet"
            description="Once your teachers record classes, you'll see a breakdown per subject here."
          />
        ) : (
          <ul className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
            {subjectStats.map((sub) => {
              const g = thresholdGuidance(sub);
              const st = attendanceStatus(sub.rate, sub.total > 0);
              return (
                <li key={sub.id} className="glass-well flex flex-col items-center rounded-[20px] px-4 pb-4 pt-5 text-center">
                  <AttendanceRing rate={sub.rate} total={sub.total} size={96} stroke={9} caption={`${sub.present}/${sub.total}`} label={`${sub.name} attendance ${formatPercent(sub.rate, 0)}`} />
                  <p className="mt-3 w-full truncate text-sm font-semibold text-ink" title={sub.name}>
                    {sub.name}
                  </p>
                  <StatusBadge tone={st.tone} className="mt-1.5">
                    {st.label}
                  </StatusBadge>
                  {g && (
                    <p className="mt-2 text-[12px] leading-4 text-ink-3">
                      {g.kind === "buffer"
                        ? g.count === 0
                          ? "Don't miss the next class"
                          : `Can miss ${g.count} more ${g.count === 1 ? "class" : "classes"}`
                        : `Attend the next ${g.count} to reach ${ATTENDANCE_THRESHOLD}%`}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card className="overflow-hidden" aria-labelledby="records">
        <CardHeader
          id="records"
          icon={ListOrdered}
          iconTile={palette.indigo.tile}
          title="Class records"
          description={`${entries.length} ${entries.length === 1 ? "record" : "records"}`}
        />
        <div>
          <DataTable
            caption="Class attendance records"
            columns={columns}
            rows={visible}
            rowKey="id"
            initialSort={{ key: "date", dir: "desc" }}
            search={{ placeholder: "Search by subject", getText: (r) => r.subject }}
            toolbar={
              <SegmentedControl
                label="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All" },
                  { value: "present", label: "Present" },
                  { value: "absent", label: "Absent" },
                ]}
              />
            }
            empty={
              <EmptyState
                icon={Inbox}
                title={statusFilter === "all" ? "No attendance records yet" : `No ${statusFilter} records`}
                description={statusFilter === "all" ? "Records appear after your first recorded class." : undefined}
                compact
              />
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default StudentAttendance;
