import { forwardRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, BarChart3, Eye, EyeOff, Loader2, ScanFace, ShieldCheck } from "lucide-react";
import AmbientBackground from "../components/ui/AmbientBackground";
import { useTheme } from "../theme/useTheme";
import overview from "../assets/landing/teacher-overview.jpeg";
import overviewDark from "../assets/landing/teacher-overview-dark.jpeg";
import logo from "../assets/Logo.svg";
import { ThemeToggle } from "../components/dashboard/HeaderMenus";

const POINTS = [
  { icon: ScanFace, title: "One photo, whole class", body: "Face recognition suggests who is present." },
  { icon: ShieldCheck, title: "Teacher-confirmed", body: "Nothing is saved until the roster is reviewed." },
  { icon: BarChart3, title: "Always in the know", body: "Live attendance standing for every student." },
];

// Shared shell for sign-in and sign-up: a glass form card, and on large
// screens a brand panel with a glimpse of the product.
export const AuthLayout = ({ title, subtitle, children, footer }) => {
  const reduce = useReducedMotion();
  const { resolved } = useTheme();
  return (
    <div className="relative flex min-h-screen flex-col font-sans text-ink antialiased">
      <AmbientBackground />
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg">
          <img src={logo} alt="" className="h-7 w-7" />
          <span className="text-[15px] font-semibold tracking-tight">AttendEase</span>
        </Link>
        <div className="glass-chrome flex items-center rounded-full p-1">
          <ThemeToggle tooltipSide="bottom-end" />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-10 px-4 pb-16 pt-6 sm:items-center sm:px-6 sm:pt-0 lg:grid-cols-[minmax(0,440px),minmax(0,1fr)] lg:gap-14">
        <motion.div
          className="glass-panel glass-sheen mx-auto w-full max-w-[440px] rounded-[28px] px-6 py-8 sm:px-9 sm:py-10"
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.7 }}
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface shadow-[inset_0_1px_0_0_rgb(var(--glass-edge)/var(--glass-edge-a)),0_10px_24px_-12px_rgb(82_103_232/0.6)] ring-1 ring-black/[0.04] dark:bg-white/10">
            <img src={logo} alt="" className="h-9 w-9" />
          </span>
          <h1 className="mt-5 text-center text-[1.65rem] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
          {subtitle && <p className="mt-2 text-center text-[15px] text-ink-2">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <p className="mt-7 border-t border-line/70 pt-6 text-center text-[14px] text-ink-2">{footer}</p>}
        </motion.div>

        <motion.aside
          aria-hidden="true"
          className="bg-hero relative hidden overflow-hidden rounded-[32px] p-10 text-white shadow-[0_40px_80px_-40px_rgb(var(--hero-via)/0.7)] lg:block"
          style={{ "--hero-from": "67 56 202", "--hero-via": "82 103 232", "--hero-to": "14 116 144" }}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.8, delay: 0.1 }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255/0.16)_0%,transparent_40%)]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/20 bg-[radial-gradient(closest-side,rgb(255_255_255/0.18),transparent)]" />
          <p className="relative text-[13px] font-medium text-white/75">Automated attendance</p>
          <p className="relative mt-2 max-w-sm text-[30px] font-semibold leading-[1.1] tracking-[-0.035em]">Take attendance with one photo.</p>
          <ul className="relative mt-7 space-y-3.5">
            {POINTS.map(({ icon: Icon, title: t, body }) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.25)] ring-1 ring-inset ring-white/20">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{t}</span>
                  <span className="block text-[13px] text-white/75">{body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="relative -mb-24 mt-9 translate-x-10 rounded-[20px] bg-white/15 p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45)] ring-1 ring-inset ring-white/25 backdrop-blur-md">
            <img src={resolved === "dark" ? overviewDark : overview} alt="" className="block w-full rounded-[14px]" loading="lazy" decoding="async" />
          </div>
        </motion.aside>
      </main>
    </div>
  );
};

const inputClass =
  "mt-1.5 h-12 w-full rounded-control border border-line-strong bg-surface/80 px-3.5 text-[15px] shadow-[inset_0_1px_2px_0_rgb(16_24_39/0.04)] dark:bg-canvas/50 text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15";

// Input with a show/hide toggle when it is a password field.
const PasswordAware = ({ id, error, input, inputRef }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = input.type === "password";
  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputClass} ${isPassword ? "pr-12" : ""}`}
        {...input}
        type={isPassword && visible ? "text" : input.type}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          aria-controls={id}
          className="focus-ring absolute right-1.5 top-[calc(50%+3px)] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-ink/[0.05] hover:text-ink"
        >
          {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      )}
    </div>
  );
};

// Labeled input that works with react-hook-form's register() (needs the ref).
export const AuthField = forwardRef(({ id, label, error, ...input }, ref) => (
  <div>
    <label htmlFor={id} className="block text-[13px] font-medium text-ink">
      {label}
    </label>
    <PasswordAware id={id} error={error} input={input} inputRef={ref} />
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-danger">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {error}
      </p>
    )}
  </div>
));
AuthField.displayName = "AuthField";

export const SubmitButton = ({ loading, loadingText, children }) => (
  <button
    type="submit"
    disabled={loading}
    className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand-gradient text-[15px] font-medium text-white shadow-glow transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {loading ? loadingText : children}
  </button>
);

export const AuthLink = ({ to, children }) => (
  <Link to={to} className="focus-ring rounded font-medium text-brand hover:underline">
    {children}
  </Link>
);
