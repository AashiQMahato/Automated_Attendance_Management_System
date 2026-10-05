import React from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import Button from "./Button";

export const EmptyState = ({ icon: Icon, title, description, action, compact = false, className = "" }) => (
  <div className={`flex flex-col items-center justify-center text-center ${compact ? "px-4 py-8" : "px-6 py-14"} ${className}`}>
    {Icon && (
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
        <Icon className="h-[18px] w-[18px] text-ink-3" aria-hidden="true" />
      </div>
    )}
    <p className="text-sm font-medium text-ink">{title}</p>
    {description && <p className="mt-1 max-w-xs text-[13px] leading-5 text-ink-3">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// Never surfaces raw technical errors; explains and offers a retry.
export const ErrorState = ({
  title = "We couldn't load this",
  description = "This is usually temporary. Check your connection and try again.",
  onRetry,
  compact = false,
  className = "",
}) => (
  <div
    role="alert"
    className={`flex flex-col items-center justify-center text-center ${compact ? "px-4 py-8" : "px-6 py-14"} ${className}`}
  >
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-danger/10">
      <CloudOff className="h-[18px] w-[18px] text-danger" aria-hidden="true" />
    </div>
    <p className="text-sm font-medium text-ink">{title}</p>
    <p className="mt-1 max-w-xs text-[13px] leading-5 text-ink-3">{description}</p>
    {onRetry && (
      <Button className="mt-4" size="sm" icon={RefreshCw} onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
