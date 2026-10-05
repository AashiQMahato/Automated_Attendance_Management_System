import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-brand text-brand-fg hover:bg-brand/90 shadow-xs",
  secondary: "bg-surface text-ink border border-line hover:bg-surface-2 hover:border-line-strong shadow-xs",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90 dark:text-canvas shadow-xs",
};

const sizes = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-9 gap-2 px-3.5 text-sm",
  lg: "h-11 gap-2 px-5 text-[15px]",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

const Button = forwardRef(
  (
    { variant = "secondary", size = "md", icon: Icon, loading = false, className = "", children, type = "button", disabled, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`focus-ring inline-flex shrink-0 select-none whitespace-nowrap items-center justify-center rounded-lg font-medium transition-[background-color,border-color,color,transform] duration-150 ease-apple active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={2} />
      )}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export default Button;
