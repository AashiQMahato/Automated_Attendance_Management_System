import { useId } from "react";

export const inputClass =
  "focus-ring h-11 w-full rounded-control border border-line bg-surface/70 px-3.5 text-sm text-ink shadow-[inset_0_1px_2px_0_rgb(16_24_39/0.04)] placeholder:text-ink-3 transition-[border-color,background-color,box-shadow] hover:border-brand/40 focus-visible:border-brand/60 focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:ring-offset-0 dark:bg-canvas/40 dark:focus-visible:bg-canvas/60";

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
