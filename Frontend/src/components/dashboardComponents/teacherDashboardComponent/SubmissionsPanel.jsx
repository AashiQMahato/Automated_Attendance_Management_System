import { useEffect, useRef, useState } from "react";
import { Input, InputNumber, message } from "antd";
import { CalendarClock, CheckCircle2, ExternalLink, Inbox } from "lucide-react";
import api from "../../../lib/api";
import { dayjs, dueStatus, titleCase } from "../../../lib/format";
import { colorFor, colors as palette } from "../../ui/colors";
import SidePanel, { PanelSection } from "../../ui/SidePanel";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import StatusBadge from "../../ui/StatusBadge";
import { ProgressRing } from "../../ui/Progress";
import { EmptyState, ErrorState } from "../../ui/States";
import { Skeleton } from "../../ui/Skeleton";

const gradeTone = (g) => (g >= 75 ? "success" : g >= 50 ? "warning" : "danger");

// One submission with an inline grade form (PATCH …/submissions/:id/grade).
const SubmissionRow = ({ assignmentId, submission, dueDate, onGraded }) => {
  const graded = submission.grade !== undefined && submission.grade !== null;
  const [editing, setEditing] = useState(!graded);
  const [grade, setGrade] = useState(graded ? submission.grade : null);
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);
  const name = submission.student?.fullName || "Former student";
  const late = submission.submittedAt && dayjs(submission.submittedAt).isAfter(dayjs(dueDate).endOf("day"));

  const save = async () => {
    if (grade === null || grade === undefined || grade === "") {
      message.warning("Enter a grade from 0 to 100");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/assignments/${assignmentId}/submissions/${submission._id}/grade`, { grade, feedback });
      message.success(`Graded ${name}`);
      setEditing(false);
      onGraded(submission._id, { grade: Number(grade), feedback });
    } catch (error) {
      message.error(error.response?.data?.message || "Couldn't save the grade. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="glass-well rounded-2xl p-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{name}</p>
          <p className="text-xs text-ink-3">
            {submission.submittedAt ? dayjs(submission.submittedAt).format("MMM D, h:mm A") : "Submitted"}
            {late && <span className="text-warning"> · late</span>}
          </p>
        </div>
        {graded && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="focus-ring rounded-full"
            aria-label={`Edit grade for ${name}, currently ${submission.grade}`}
          >
            <StatusBadge tone={gradeTone(submission.grade)} icon={CheckCircle2}>
              {submission.grade}/100
            </StatusBadge>
          </button>
        ) : (
          <StatusBadge tone="warning">To grade</StatusBadge>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {submission.submissionUrl && (
          <a
            href={submission.submissionUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-[13px] font-medium text-brand hover:bg-brand/[0.08]"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Open submission
          </a>
        )}
        {graded && !editing && submission.feedback && <p className="min-w-0 flex-1 truncate text-xs text-ink-3">“{submission.feedback}”</p>}
      </div>

      {editing && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor={`grade-${submission._id}`} className="text-[13px] font-medium text-ink-2">
              Grade
            </label>
            <InputNumber
              id={`grade-${submission._id}`}
              min={0}
              max={100}
              value={grade}
              onChange={setGrade}
              addonAfter="/ 100"
              className="w-36"
            />
          </div>
          <Input.TextArea
            aria-label={`Feedback for ${name}`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback (optional)"
            autoSize={{ minRows: 2, maxRows: 5 }}
          />
          <div className="flex justify-end gap-2">
            {graded && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={save} loading={saving}>
              Save grade
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};

/*
  Teacher's view of one assignment's submissions, with grading. Loads the
  assignment by id (that response includes student names).
*/
const SubmissionsPanel = ({ assignment: openAssignment, onClose, onChanged }) => {
  // Keep showing the last assignment while the drawer animates closed.
  const lastRef = useRef(null);
  if (openAssignment) lastRef.current = openAssignment;
  const assignment = openAssignment || lastRef.current;
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | error | ready

  const load = () => {
    if (!assignment) return;
    setState("loading");
    api
      .get(`/assignments/${assignment._id}`)
      .then(({ data }) => {
        setDetail(data.data);
        setState("ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(() => {
    if (!openAssignment) return;
    setDetail(null);
    load();
  }, [openAssignment?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const submissions = detail?.submissions || [];
  const graded = submissions.filter((s) => s.grade !== undefined && s.grade !== null).length;
  const due = assignment ? dueStatus(assignment.dueDate) : null;
  const subjectColor = colorFor(assignment?.subject?._id);

  const onGraded = (id, patch) => {
    setDetail((d) => ({ ...d, submissions: d.submissions.map((s) => (s._id === id ? { ...s, ...patch } : s)) }));
    onChanged?.();
  };

  return (
    <SidePanel
      open={!!openAssignment}
      onClose={onClose}
      label={`Submissions for ${titleCase(assignment?.title)}`}
      width={520}
      accent="from-amber-500/[0.1] via-amber-500/[0.03] to-transparent"
      header={
        assignment && (
          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${palette[subjectColor].tile}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${palette[subjectColor].dot}`} aria-hidden="true" />
              {titleCase(assignment.subject?.name)}
            </span>
            <h2 className="mt-2 text-[20px] font-semibold leading-tight tracking-[-0.025em] text-ink">{titleCase(assignment.title)}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-3">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              Due {dayjs(assignment.dueDate).format("ddd, MMM D, YYYY")}
              <StatusBadge tone={due.tone} className="ml-1">
                {due.key === "upcoming" ? "Open" : due.label}
              </StatusBadge>
            </p>
          </div>
        )
      }
    >
      {state === "loading" && (
        <div className="space-y-3" role="status" aria-label="Loading submissions">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {state === "error" && <ErrorState title="We couldn't load submissions" onRetry={load} compact />}
      {state === "ready" && (
        <>
          <div className="glass-well flex items-center gap-4 rounded-2xl p-4">
            <ProgressRing value={submissions.length ? (graded / submissions.length) * 100 : 0} size={64} stroke={7} tone="success" label="Graded share">
              <span className="text-sm font-semibold tabular-nums text-ink">
                {graded}/{submissions.length}
              </span>
            </ProgressRing>
            <div>
              <p className="text-[15px] font-semibold text-ink">
                {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
              </p>
              <p className="text-[13px] text-ink-3">
                {submissions.length === 0 ? "Nothing to grade yet" : graded === submissions.length ? "All graded" : `${submissions.length - graded} left to grade`}
              </p>
            </div>
          </div>

          <PanelSection title="Submissions">
            {submissions.length === 0 ? (
              <EmptyState icon={Inbox} title="No submissions yet" description="Students' work will appear here as they submit." compact />
            ) : (
              <ul className="space-y-2.5">
                {[...submissions]
                  .sort((a, b) => Number(a.grade != null) - Number(b.grade != null) || new Date(b.submittedAt) - new Date(a.submittedAt))
                  .map((s) => (
                    <SubmissionRow key={s._id} assignmentId={assignment._id} submission={s} dueDate={assignment.dueDate} onGraded={onGraded} />
                  ))}
              </ul>
            )}
          </PanelSection>

          {detail?.description && (
            <PanelSection title="Instructions">
              <p className="whitespace-pre-line text-[13.5px] leading-6 text-ink-2">{detail.description}</p>
            </PanelSection>
          )}
        </>
      )}
    </SidePanel>
  );
};

export default SubmissionsPanel;
