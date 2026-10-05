import React from "react";

const PageHeader = ({ title, description, actions, meta, eyebrow }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="mb-1 text-[13px] font-medium text-ink-3">{eyebrow}</p>}
      <h1 className="text-[22px] font-semibold leading-tight tracking-[-0.022em] text-ink sm:text-[26px]">{title}</h1>
      {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);

export default PageHeader;
