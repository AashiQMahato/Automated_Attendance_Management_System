import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  // Liquid primary: gradient + inner highlight + colored depth.
  primary: "bg-brand-gradient text-white shadow-glow hover:-translate-y-px hover:brightness-[1.08]",
  // Glass secondary: translucent with a bright rim; reads on any surface.
  secondary:
    "border border-[rgb(var(--glass-line)/0.1)] bg-surface/70 text-ink shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_1px_2px_0_rgb(16_24_39/0.05)] backdrop-blur hover:bg-surface hover:text-brand dark:bg-white/[0.06] dark:hover:bg-white/[0.1]",
  ghost: "text-ink-2 hover:bg-brand/[0.08] hover:text-brand",
  danger:
    "bg-[linear-gradient(135deg,#D9485F_0%,#C23B55_100%)] text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25),0_8px_20px_-10px_rgb(194_59_85/0.6)] hover:brightness-110",
  "danger-soft": "bg-danger/10 text-danger hover:bg-danger/15",
  // For use on gradient surfaces (hero banners).
  white: "bg-white text-[#3346c4] shadow-[inset_0_-1px_0_0_rgb(16_24_39/0.06),0_8px_20px_-10px_rgb(0_0_0/0.4)] hover:-translate-y-px hover:bg-white/95",
  glass: "bg-white/[0.14] text-white ring-1 ring-inset ring-white/30 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25)] backdrop-blur-md hover:bg-white/[0.22]",
};

const sizes = {
  sm: "h-8 gap-1.5 px-3 text-[13px]",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-[15px]",
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
      aria-busy={loading || undefined}
      className={`focus-ring inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-control font-medium transition-[background-color,border-color,color,transform,filter,box-shadow] duration-200 ease-apple active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.secondary} ${sizes[size]} ${className}`}
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
