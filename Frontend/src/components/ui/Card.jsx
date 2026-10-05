import React from "react";

export const Card = ({ as: Tag = "section", className = "", interactive = false, children, ...props }) => (
  <Tag
    className={`rounded-xl border border-line bg-surface shadow-card ${
      interactive ? "transition-[box-shadow,border-color] duration-200 ease-apple hover:border-line-strong hover:shadow-lift" : ""
    } ${className}`}
    {...props}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ title, description, action, icon: Icon, className = "", id }) => (
  <div className={`flex items-start justify-between gap-4 px-5 pt-5 ${className}`}>
    <div className="flex min-w-0 items-start gap-2.5">
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />}
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold leading-6 tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
      </div>
    </div>
    {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
  </div>
);

export const CardBody = ({ className = "", children }) => <div className={`p-5 ${className}`}>{children}</div>;
