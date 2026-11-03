import { forwardRef } from "react";
import { Search, X } from "lucide-react";

// Glass search field with a clear button. Controlled: value + onChange(text).
const SearchInput = forwardRef(({ value, onChange, placeholder = "Search", className = "", size = "md", ...props }, ref) => (
  <label className={`relative block ${className}`}>
    <span className="sr-only">{placeholder}</span>
    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
    <input
      ref={ref}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`focus-ring w-full rounded-control border border-line bg-surface/70 pl-9 pr-9 text-sm text-ink shadow-[inset_0_1px_2px_0_rgb(16_24_39/0.04)] transition-[border-color,background-color,box-shadow] placeholder:text-ink-3 hover:border-line-strong focus-visible:border-brand/60 focus-visible:bg-surface focus-visible:ring-4 focus-visible:ring-brand/15 focus-visible:ring-offset-0 dark:bg-canvas/40 [&::-webkit-search-cancel-button]:hidden ${
        size === "sm" ? "h-9" : "h-10"
      }`}
      {...props}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="focus-ring absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-ink/[0.08] text-ink-2 transition-colors hover:bg-ink/[0.14] dark:bg-white/10"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    )}
  </label>
));
SearchInput.displayName = "SearchInput";

export default SearchInput;
