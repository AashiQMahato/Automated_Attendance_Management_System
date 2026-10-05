import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "bg-brand-gradient text-white shadow-glow hover:-translate-y-px hover:brightness-110",
  secondary: "bg-surface text-ink border border-line shadow-xs hover:border-brand/30 hover:text-brand hover:bg-brand/[0.03]",
  ghost: "text-ink-2 hover:bg-brand/[0.07] hover:text-brand",
  danger: "bg-danger text-white shadow-xs hover:brightness-110 dark:text-canvas",
  // For use on gradient surfaces (hero banners).
  white: "bg-white text-indigo-700 shadow-[0_6px_16px_-8px_rgb(0_0_0/0.35)] hover:-translate-y-px hover:bg-white/95",
  glass: "bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur hover:bg-white/25",
};

const sizes = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-[15px]",
  icon: "h-10 w-10",
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
      className={`focus-ring inline-flex shrink-0 select-none whitespace-nowrap items-center justify-center rounded-[10px] font-medium transition-[background-color,border-color,color,transform,filter,box-shadow] duration-200 ease-apple active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
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
