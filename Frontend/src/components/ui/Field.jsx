import React, { useId } from "react";

export const inputClass =
  "focus-ring h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 transition-colors hover:border-line-strong focus-visible:border-brand/60 focus-visible:ring-offset-0";

// Label + control + optional hint, wired up for screen readers.
const Field = ({ label, hint, children }) => {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children({ id, "aria-describedby": hintId })}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
};

export default Field;
