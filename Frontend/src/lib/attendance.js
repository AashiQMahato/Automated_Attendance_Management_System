import { ATTENDANCE_THRESHOLD, dayjs, percent, titleCase } from "./format";

const idOf = (v) => (v && typeof v === "object" ? v._id : v);

// Flattens GET /attendance/student records to the signed-in student's entries.
export const studentEntries = (records, studentId) =>
  (records || []).flatMap((record) =>
    (record.students || [])
      .filter((s) => idOf(s.student) === studentId)
      .map((s) => ({
        id: s._id || `${record._id}-${studentId}`,
        date: record.date,
        subjectId: idOf(record.subject),
        subject: titleCase(record.subject?.name) || "Subject",
        status: s.status,
        timestamp: s.timestamp,
      })),
  );

export const summarize = (entries) => {
  const total = entries.length;
  const present = entries.filter((e) => e.status === "present").length;
  return { total, present, absent: total - present, rate: percent(present, total) };
};

// Per-subject rows, including enrolled subjects with no sessions yet.
export const bySubject = (entries, subjects = []) => {
  const map = new Map();
  subjects.forEach((s) => map.set(s._id, { id: s._id, name: titleCase(s.name), code: s.code, present: 0, absent: 0, total: 0 }));
  entries.forEach((e) => {
    if (!map.has(e.subjectId)) map.set(e.subjectId, { id: e.subjectId, name: e.subject, code: "", present: 0, absent: 0, total: 0 });
    const row = map.get(e.subjectId);
    row.total += 1;
    if (e.status === "present") row.present += 1;
    else row.absent += 1;
  });
  return [...map.values()].map((r) => ({ ...r, rate: percent(r.present, r.total) }));
};

// Buckets entries into the last `count` weeks or months (oldest first).
export const trendSeries = (entries, mode = "week", count = 8) => {
  const unit = mode === "month" ? "month" : "isoWeek";
  const start = dayjs().startOf(unit);
  const buckets = Array.from({ length: count }, (_, i) => {
    const from = start.subtract(count - 1 - i, mode === "month" ? "month" : "week");
    return {
      key: from.valueOf(),
      from,
      label: mode === "month" ? from.format("MMM") : from.format("MMM D"),
      present: 0,
      total: 0,
    };
  });
  entries.forEach((e) => {
    const d = dayjs(e.date).startOf(unit);
    const b = buckets.find((x) => x.from.isSame(d));
    if (b) {
      b.total += 1;
      if (e.status === "present") b.present += 1;
    }
  });
  return buckets.map((b) => ({ ...b, rate: b.total ? Math.round(percent(b.present, b.total) * 10) / 10 : null }));
};

export const monthStats = (entries, offset = 0) => {
  const m = dayjs().subtract(offset, "month");
  return summarize(entries.filter((e) => dayjs(e.date).isSame(m, "month")));
};

// How many classes the student can miss and stay >= threshold, or how many
// consecutive classes they must attend to get back above it.
export const thresholdGuidance = ({ present, total }, threshold = ATTENDANCE_THRESHOLD) => {
  if (!total) return null;
  const t = threshold / 100;
  if (present / total >= t) {
    return { kind: "buffer", count: Math.max(0, Math.floor(present / t - total)) };
  }
  return { kind: "recover", count: Math.ceil((t * total - present) / (1 - t)) };
};

// Teacher side: per-student rates across a set of subject sessions.
export const studentRatesFromSessions = (sessions) => {
  const map = new Map();
  sessions.forEach((session) =>
    (session.students || []).forEach((s) => {
      const id = idOf(s.student);
      if (!map.has(id)) map.set(id, { id, present: 0, total: 0, bySubject: new Map() });
      const row = map.get(id);
      row.total += 1;
      if (s.status === "present") row.present += 1;
      const subj = row.bySubject.get(session.subjectId) || { present: 0, total: 0 };
      subj.total += 1;
      if (s.status === "present") subj.present += 1;
      row.bySubject.set(session.subjectId, subj);
    }),
  );
  return map;
};

export const sessionRate = (session) => {
  const total = session.students?.length || 0;
  const present = (session.students || []).filter((s) => s.status === "present").length;
  return { present, total, rate: percent(present, total) };
};
