import React from "react";

const tones = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-brand/10 text-brand",
  neutral: "bg-surface-2 text-ink-2",
};

// items: [{ id, icon, tone, title, meta, time, dateTime }]
const ActivityTimeline = ({ items }) => (
  <ol className="relative">
    {items.map((item, i) => {
      const Icon = item.icon;
      const last = i === items.length - 1;
      return (
        <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
          {!last && <span className="absolute left-[13px] top-8 bottom-1 w-px bg-line" aria-hidden="true" />}
          <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tones[item.tone || "neutral"]}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[13px] leading-5 text-ink">{item.title}</p>
            <p className="text-xs text-ink-3">
              {item.meta && <span>{item.meta} · </span>}
              <time dateTime={item.dateTime}>{item.time}</time>
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);

export default ActivityTimeline;
