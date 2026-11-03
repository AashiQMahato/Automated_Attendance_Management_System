import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import logo from "../../assets/Logo.svg";
import { ThemeToggle } from "../dashboard/HeaderMenus";
import teacherOverview from "../../assets/landing/teacher-overview.jpeg";
import takeAttendance from "../../assets/landing/take-attendance.jpeg";
import reports from "../../assets/landing/reports.jpeg";
import studentOverview from "../../assets/landing/student-overview.jpeg";
import calendar from "../../assets/landing/calendar.jpeg";
import teacherOverviewDark from "../../assets/landing/teacher-overview-dark.jpeg";
import takeAttendanceDark from "../../assets/landing/take-attendance-dark.jpeg";
import reportsDark from "../../assets/landing/reports-dark.jpeg";
import studentOverviewDark from "../../assets/landing/student-overview-dark.jpeg";
import calendarDark from "../../assets/landing/calendar-dark.jpeg";
import { useTheme } from "../../theme/useTheme";
import AmbientBackground from "../ui/AmbientBackground";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#teachers", label: "For teachers" },
  { href: "/#students", label: "For students" },
  { href: "/#privacy", label: "Privacy" },
];

const STEPS = [
  {
    title: "Take a photo",
    body: "Upload a class photo or use your phone's camera. iPhone HEIC photos work too.",
  },
  {
    title: "Review the roster",
    body: "Recognized students are marked present with a confidence score. Change anyone with one tap.",
  },
  {
    title: "Save",
    body: "Attendance is recorded for the subject and date, and students see it in their dashboard right away.",
  },
];

const TEACHER_POINTS = [
  "Today's classes and which ones still need attendance",
  "Weekly trends and per-subject breakdowns",
  "Students below 75%, so you can follow up early",
  "Assignments with submissions and grading",
  "Holiday announcements for the whole class",
  "CSV export for your records",
];

const STUDENT_POINTS = [
  "Attendance by subject, with every class recorded",
  "How many more classes you can miss and stay above 75%",
  "Upcoming assignment deadlines",
  "Calendar in Bikram Sambat or Gregorian dates",
];

// Fade up once when scrolled into view; static for reduced-motion users.
export const Reveal = ({ children, className = "", delay = 0 }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", bounce: 0, duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

// Shows the app in the same theme as the page (only that image is downloaded).
const Screenshot = ({ src, dark, alt, eager = false }) => {
  const { resolved } = useTheme();
  return (
    // Liquid glass bezel: a translucent rim around the screenshot.
    <div className="glass-panel rounded-[18px] p-1.5 shadow-[0_40px_80px_-40px_rgb(31_41_80/0.45)] sm:rounded-[28px] sm:p-2.5">
      <div className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10 sm:rounded-[20px]">
      <img
        src={resolved === "dark" ? dark : src}
        alt={alt}
        width={2160}
        height={1350}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="block h-auto w-full"
      />
      </div>
    </div>
  );
};

export const PrimaryLink = ({ to, children }) => (
  <Link
    to={to}
    className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-brand-gradient px-6 text-[15px] font-medium text-white shadow-glow transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
  >
    {children}
  </Link>
);

export const TextLink = ({ to, children }) => (
  <Link
    to={to}
    className="focus-ring group inline-flex items-center gap-0.5 rounded text-[15px] font-medium text-brand hover:underline"
  >
    {children}
    <ChevronRight
      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      aria-hidden="true"
    />
  </Link>
);

export const PointList = ({ items }) => (
  <ul className="mt-8 space-y-3">
    {items.map((item) => (
      <li key={item} className="flex gap-3 text-[15px] leading-6 text-ink-2">
        <Check
          className="mt-1 h-4 w-4 shrink-0 text-brand"
          aria-hidden="true"
          strokeWidth={2.5}
        />
        {item}
      </li>
    ))}
  </ul>
);

export const Eyebrow = ({ children }) => (
  <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand">
    {children}
  </p>
);

export const SectionTitle = ({ children, className = "" }) => (
  <h2
    className={`text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[2.75rem] ${className}`}
  >
    {children}
  </h2>
);

export const Header = () => (
  <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">
    <div className="glass-chrome mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 rounded-full pl-4 pr-2 sm:pl-5">
      <Link to="/" className="focus-ring flex items-center gap-2 rounded-lg">
        <img src={logo} alt="" className="h-7 w-7" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          AttendEase
        </span>
      </Link>
      <nav
        aria-label="Page sections"
        className="hidden items-center gap-7 md:flex"
      >
        {NAV.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="focus-ring rounded text-[13px] text-ink-2 transition-colors hover:text-ink"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <Link
          to="/login"
          className="focus-ring whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-medium text-ink-2 transition-colors hover:text-ink sm:px-3"
        >
          Sign in
        </Link>
        <Link
          to="/signup"
          className="focus-ring whitespace-nowrap rounded-full bg-brand-gradient px-3.5 py-2 text-[13px] sm:px-4 font-medium text-white shadow-glow transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.97]"
        >
          Get started
        </Link>
      </div>
    </div>
  </header>
);

const Hero = () => (
  <section className="overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
    <Reveal className="mx-auto max-w-3xl text-center">
      <img src={logo} alt="" className="mx-auto h-16 w-16 sm:h-20 sm:w-20" />
      <h1 className="mt-8 text-balance text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.04em] text-ink sm:text-[4.25rem]">
        Take attendance with one photo.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-pretty text-[17px] leading-7 text-ink-2 sm:text-[19px] sm:leading-8">
        AttendEase recognizes enrolled students in a class photo and fills in
        the roster. You check it, then save.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <PrimaryLink to="/signup">
          Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </PrimaryLink>
        <TextLink to="/login">Sign in</TextLink>
      </div>
    </Reveal>
    <Reveal className="mx-auto mt-16 max-w-6xl sm:mt-20" delay={0.15}>
      <Screenshot
        src={teacherOverview}
        dark={teacherOverviewDark}
        alt="Teacher dashboard showing today's classes, attendance statistics and quick actions"
        eager
      />
    </Reveal>
  </section>
);

const HowItWorks = () => (
  <section
    id="how-it-works"
    className="scroll-mt-20 border-y border-line/50 bg-white/45 dark:bg-white/[0.025] px-4 py-24 sm:px-6 sm:py-32"
  >
    <div className="mx-auto max-w-6xl">
      <Reveal className="max-w-2xl">
        <Eyebrow>How it works</Eyebrow>
        <SectionTitle className="mt-3">
          From class photo to saved attendance in three steps.
        </SectionTitle>
      </Reveal>
      <ol className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {STEPS.map((step, i) => (
          <Reveal key={step.title} delay={i * 0.08}>
            <li className="border-t border-line-strong pt-6">
              <span className="font-mono text-[13px] text-ink-3">0{i + 1}</span>
              <h3 className="mt-3 text-[19px] font-semibold tracking-tight text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-6 text-ink-2">
                {step.body}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal className="mt-16">
        <Screenshot
          src={takeAttendance}
          dark={takeAttendanceDark}
          alt="Take attendance page with photo recognition next to the class roster"
        />
      </Reveal>
    </div>
  </section>
);

const Split = ({
  id,
  eyebrow,
  title,
  body,
  points,
  image,
  imageDark,
  imageAlt,
  reverse = false,
  tinted = false,
}) => (
  <section
    id={id}
    className={`scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32 ${tinted ? "border-y border-line/50 bg-white/45 dark:bg-white/[0.025]" : ""}`}
  >
    <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <Reveal className={reverse ? "lg:order-2" : ""}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <SectionTitle className="mt-3">{title}</SectionTitle>
        <p className="mt-5 text-[17px] leading-7 text-ink-2">{body}</p>
        <PointList items={points} />
      </Reveal>
      <Reveal className={reverse ? "lg:order-1" : ""} delay={0.1}>
        <Screenshot src={image} dark={imageDark} alt={imageAlt} />
      </Reveal>
    </div>
  </section>
);

const Calendar = () => (
  <section className="px-4 pb-24 sm:px-6 sm:pb-32">
    <div className="mx-auto max-w-6xl">
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionTitle>Bikram Sambat or Gregorian. Your choice.</SectionTitle>
        <p className="mt-5 text-[17px] leading-7 text-ink-2">
          Switch the calendar between BS and AD. Holidays and assignment
          deadlines appear on both.
        </p>
      </Reveal>
      <Reveal className="mt-14" delay={0.1}>
        <Screenshot
          src={calendar}
          dark={calendarDark}
          alt="Calendar in Bikram Sambat showing holidays and assignment deadlines"
        />
      </Reveal>
    </div>
  </section>
);

const Privacy = () => (
  <section
    id="privacy"
    className="scroll-mt-20 bg-[#101827] bg-[radial-gradient(60%_80%_at_100%_0%,rgb(82_103_232/0.35),transparent_70%),radial-gradient(50%_70%_at_0%_100%,rgb(32_185_154/0.2),transparent_70%)] px-4 py-24 text-white dark:bg-[#0B111D] sm:px-6 sm:py-32"
  >
    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal>
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-white/60">
          Privacy
        </p>
        <h2 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.75rem]">
          Face data stays with your institution.
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <dl className="space-y-8">
          {[
            [
              "Recognition runs on your server",
              "Photos are processed by your own face service. Nothing is sent to a third-party recognition API.",
            ],
            [
              "A teacher confirms every result",
              "Recognition only suggests who is present. Nothing is saved until a teacher reviews the roster.",
            ],
            [
              "Works without it",
              "If face recognition isn't set up, teachers mark attendance manually in the same roster.",
            ],
          ].map(([term, desc]) => (
            <div key={term}>
              <dt className="text-[17px] font-semibold">{term}</dt>
              <dd className="mt-1.5 text-[15px] leading-6 text-white/70">
                {desc}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  </section>
);

const ClosingCta = () => (
  <section className="px-4 py-24 text-center sm:px-6 sm:py-32">
    <Reveal className="mx-auto max-w-2xl">
      <SectionTitle>Ready for your next class?</SectionTitle>
      <p className="mt-5 text-[17px] leading-7 text-ink-2">
        Create an account as a teacher or a student.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
        <PrimaryLink to="/signup">
          Create account <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </PrimaryLink>
        <TextLink to="/login">Sign in</TextLink>
      </div>
    </Reveal>
  </section>
);

export const Footer = () => (
  <footer className="border-t border-line px-4 py-10 sm:px-6">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-5 w-5" />
        <span>© {new Date().getFullYear()} AttendEase</span>
      </div>
      <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/about" className="focus-ring rounded hover:text-ink">
          About
        </Link>
        <Link to="/login" className="focus-ring rounded hover:text-ink">
          Sign in
        </Link>
        <Link to="/signup" className="focus-ring rounded hover:text-ink">
          Create account
        </Link>
      </nav>
    </div>
  </footer>
);

const LandingPage = () => (
  <div
    id="top"
    className="relative min-h-screen font-sans text-ink antialiased"
  >
    <AmbientBackground />
    <Header />
    <main>
      <Hero />
      <HowItWorks />
      <Split
        id="teachers"
        eyebrow="For teachers"
        title="See every class at a glance."
        body="Your dashboard shows what's left to record today, how each subject is trending, and who needs attention."
        points={TEACHER_POINTS}
        image={reports}
        imageDark={reportsDark}
        imageAlt="Reports page with attendance trends and a per-subject breakdown"
      />
      <Split
        id="students"
        eyebrow="For students"
        title="Know where you stand."
        body="Students see their own attendance, what's due next, and how close they are to the 75% minimum."
        points={STUDENT_POINTS}
        image={studentOverview}
        imageDark={studentOverviewDark}
        imageAlt="Student dashboard showing overall attendance, classes attended and upcoming deadlines"
        reverse
        tinted
      />
      <div className="border-y border-line/50 bg-white/45 dark:bg-white/[0.025]">
        <Calendar />
      </div>
      <Privacy />
      <ClosingCta />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
