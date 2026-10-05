import { useEffect, useRef, useState, useCallback } from "react";
import {
  Menu, X, ArrowRight, ArrowUpRight, PlayCircle, CheckCircle2, XCircle,
  Zap, BarChart3, Users, Lock, ScanFace, Database, Cloud,
  ChevronDown, ChevronLeft, ChevronRight, Star, Github, Linkedin, Mail,
  ArrowUp, TrendingUp, Camera, Fingerprint, LayoutDashboard,
  GraduationCap, ShieldAlert, Gauge
} from "lucide-react";

/* ---------------------------------- utils ---------------------------------- */

function useInView(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useCountUp(target, inView, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return value;
}

function Reveal({ children, className = "", delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------- root ---------------------------------- */

const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Technology", href: "#technology" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing", badge: "Soon" },
  { label: "Docs", href: "#docs" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#product");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "bg-slate-950/80 border-white/10 backdrop-blur-md" : "bg-slate-950/40 border-transparent backdrop-blur-sm"
      }`}
    >
      <nav className="flex items-center justify-between h-16 px-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <ScanFace className="w-4.5 h-4.5 text-white" strokeWidth={2.25} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">AttendEase</span>
        </a>

        <ul className="items-center hidden gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setActive(link.href)}
                className={`relative px-3.5 py-2 text-[13.5px] font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  active === link.href ? "text-white" : "text-slate-400 hover:text-slate-100"
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="text-[10px] leading-none px-1.5 py-1 rounded-full bg-cyan-400/10 text-cyan-300 font-mono">
                    {link.badge}
                  </span>
                )}
                {active === link.href && (
                  <span className="absolute left-3.5 right-3.5 -bottom-[1px] h-[1.5px] bg-blue-400 rounded-full" />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="items-center hidden gap-2 lg:flex">
          <a href="/login" className="px-3.5 py-2 text-[13.5px] font-medium text-slate-300 hover:text-white transition-colors">
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 text-[13.5px] font-medium text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <button
          className="flex items-center justify-center rounded-md lg:hidden w-9 h-9 text-slate-300 hover:bg-white/5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="relative block w-4 h-4">
            <Menu className={`w-4 h-4 absolute inset-0 transition-all duration-200 ${open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
            <X className={`w-4 h-4 absolute inset-0 transition-all duration-200 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
          </span>
        </button>
      </nav>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-white/10 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-transparent"
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-4 bg-slate-950/95">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white rounded-md hover:bg-white/5">
              {link.label}
            </a>
          ))}
          <div className="h-px my-2 bg-white/10" />
          <a href="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm font-medium text-slate-300">Login</a>
          <a href="/signup" onClick={() => setOpen(false)} className="mt-1 px-3.5 py-2.5 text-sm font-medium text-center text-slate-950 bg-white rounded-lg">
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}

function ScanCard() {
  const [confidence, setConfidence] = useState(0);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setVerified(false);
      setConfidence(0);
      let c = 0;
      const iv = setInterval(() => {
        c += 4 + Math.random() * 5;
        if (c >= 99.6) {
          c = 99.6;
          clearInterval(iv);
          setVerified(true);
        }
        setConfidence(c);
      }, 90);
      return iv;
    };
    const iv = cycle();
    const loop = setInterval(() => {
      clearInterval(iv);
      cycle();
    }, 4200);
    return () => {
      clearInterval(iv);
      clearInterval(loop);
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/40 backdrop-blur-sm w-[280px] sm:w-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-emerald-400" : "bg-cyan-400 animate-pulse"}`} />
          CAM_02 · LIVE
        </div>
        <Camera className="w-3.5 h-3.5 text-slate-500" />
      </div>

      <div className="relative h-40 mb-4 overflow-hidden border rounded-lg bg-slate-900 border-white/10">
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "14px 14px"
        }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-24 rounded-[40%] bg-gradient-to-b from-slate-700/60 to-slate-800/60 border border-white/10" />
        <div
          className={`absolute left-[76px] top-6 w-[128px] h-[112px] rounded-md border-2 transition-colors duration-300 ${
            verified ? "border-emerald-400" : "border-cyan-400"
          }`}
        >
          <span className="absolute -top-2 -left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-current" />
          <span className="absolute -top-2 -right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-current" />
          <span className="absolute -bottom-2 -left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-current" />
          <span className="absolute -bottom-2 -right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-current" />
          {!verified && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-cyan-300/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
              style={{ animation: "scanline 1.8s ease-in-out infinite" }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-slate-500">CONFIDENCE</span>
        <span className={`text-[13px] font-mono font-semibold ${verified ? "text-emerald-400" : "text-cyan-300"}`}>
          {confidence.toFixed(1)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-100 ${verified ? "bg-emerald-400" : "bg-cyan-400"}`}
          style={{ width: `${confidence}%` }}
        />
      </div>

      <div className={`flex items-center gap-2 text-[13px] font-medium transition-colors ${verified ? "text-emerald-300" : "text-slate-500"}`}>
        <CheckCircle2 className="w-4 h-4" />
        {verified ? "Identity verified" : "Analyzing..."}
      </div>
    </div>
  );
}

function FloatingToast() {
  return (
    <div
      className="absolute -left-6 sm:-left-10 bottom-6 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md px-3.5 py-3 shadow-xl flex items-center gap-2.5"
      style={{ animation: "float-slow 5s ease-in-out infinite" }}
    >
      <div className="flex items-center justify-center rounded-full w-7 h-7 bg-emerald-400/15 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <div className="leading-tight">
        <p className="text-[12.5px] font-medium text-white">Attendance marked</p>
        <p className="text-[11px] text-slate-400">A. Regmi · 09:14 AM</p>
      </div>
    </div>
  );
}

function FloatingSpark() {
  return (
    <div
      className="absolute -right-4 sm:-right-8 -top-6 rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-md px-3.5 py-3 shadow-xl w-[132px]"
      style={{ animation: "float-slower 6s ease-in-out infinite" }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono text-slate-500">TODAY</span>
        <TrendingUp className="w-3 h-3 text-blue-400" />
      </div>
      <p className="mb-2 text-lg font-semibold leading-none text-white">96.2%</p>
      <div className="flex items-end gap-[3px] h-6">
        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
          <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-blue-500/80 to-indigo-400/80" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="product" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, black 40%, transparent 100%)"
      }} />
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[640px] h-[420px] rounded-full bg-blue-600/10 blur-[110px]" />

      <div className="relative grid items-center gap-16 px-5 pt-16 pb-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:pt-24 sm:pb-28 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] font-medium text-slate-300 mb-6">
              <Sparkle /> Built for universities and training institutes
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-[2.5rem] leading-[1.08] sm:text-5xl sm:leading-[1.08] lg:text-[3.4rem] lg:leading-[1.06] font-semibold tracking-tight text-white mb-6">
              Attendance that
              <br />
              verifies <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">itself.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-[16.5px] sm:text-lg text-slate-400 leading-relaxed max-w-lg mb-9">
              AttendEase pairs YOLOv8 detection with FaceNet recognition to mark attendance the moment a student
              sits down — no proxy roll calls, no spreadsheets, no manual reconciliation at the end of term.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-wrap items-center gap-3 mb-11">
              <a href="/signup" className="group px-5 py-3 rounded-lg bg-white text-slate-950 text-[14px] font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors">
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="#demo" className="px-5 py-3 rounded-lg border border-white/15 text-slate-200 text-[14px] font-medium flex items-center gap-2 hover:bg-white/5 hover:border-white/25 transition-colors">
                <PlayCircle className="w-4 h-4" />
                Watch Demo
              </a>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <dl className="grid max-w-xl grid-cols-2 border-t sm:grid-cols-4 gap-x-6 gap-y-5 border-white/10 pt-7">
              {[
                ["99.6%", "Recognition accuracy"],
                ["YOLOv8+FaceNet", "Detection engine"],
                ["Encrypted", "Cloud storage"],
                ["<1s", "Real-time processing"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-[13.5px] font-mono font-medium text-slate-200">{value}</dt>
                  <dd className="text-[12px] text-slate-500 mt-0.5">{label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={160} className="relative flex justify-center lg:justify-end">
          <div className="relative pt-8 pb-4 pr-6">
            <ScanCard />
            <FloatingToast />
            <FloatingSpark />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TECH = ["YOLOv8", "FaceNet", "React", "Node.js", "MongoDB", "Express", "JWT", "OpenCV", "Python", "TensorFlow"];

const FOOTER_COLS = [
  { title: "Product", links: ["Overview", "Features", "How it Works", "Pricing"] },
  { title: "Resources", links: ["Documentation", "White Paper", "Case Studies", "Blog"] },
  { title: "Technology", links: ["YOLOv8 Architecture", "FaceNet Embeddings", "MERN Stack", "Cloud Integration"] },
  { title: "Support", links: ["Help Center", "Contact", "Status"] },
];

function Footer() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="relative border-t border-white/10">
      <div className="px-5 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6 mb-14">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600">
                <ScanFace className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[14.5px] font-semibold text-white">AttendEase</span>
            </div>
            <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-xs mb-5">
              AI-verified attendance for universities and training institutes. Built at IOE Engineering Campus, Kathmandu.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="GitHub" className="flex items-center justify-center w-8 h-8 transition-colors border rounded-lg border-white/10 text-slate-400 hover:text-white hover:border-white/25">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-8 h-8 transition-colors border rounded-lg border-white/10 text-slate-400 hover:text-white hover:border-white/25">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Email" className="flex items-center justify-center w-8 h-8 transition-colors border rounded-lg border-white/10 text-slate-400 hover:text-white hover:border-white/25">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[12px] font-mono uppercase tracking-wider text-slate-500 mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13.5px] text-slate-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-white/10 sm:flex-row">
          <p className="text-[12.5px] text-slate-500">&copy; 2026 AttendEase. All rights reserved.</p>
          <p className="text-[12.5px] text-slate-500">IOE Engineering Campus · Kathmandu, Nepal</p>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-xl transition-all duration-300 ${
          showTop ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}


const FAQS = [
  { q: "How accurate is the recognition?", a: "AttendEase's YOLOv8 + FaceNet pipeline runs at 99.6% recognition accuracy in typical classroom conditions, with a confidence threshold that flags uncertain matches instead of guessing." },
  { q: "How secure is the data?", a: "Attendance records and face embeddings are encrypted at rest and in transit, with role-based access so only authorized staff can view or export data." },
  { q: "Can multiple classrooms be managed?", a: "Yes. Each section runs its own camera feed and roster, all reporting into one dashboard scoped by department, course, or instructor." },
  { q: "Does it support cloud deployment?", a: "AttendEase runs on cloud infrastructure by default, so records sync in real time and stay available across campuses and devices." },
  { q: "What happens if a face isn't recognized?", a: "Low-confidence matches are held for manual review rather than auto-marked, so accuracy doesn't come at the cost of false positives." },
];

function FAQItem({ item, open, onClick }) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onClick}
        className="flex items-center justify-between w-full py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-[14.5px] sm:text-[15px] font-medium text-white pr-6">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-blue-400" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="text-[13.5px] text-slate-500 leading-relaxed pr-8">{item.a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section className="max-w-4xl px-5 py-20 mx-auto sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="mb-10">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">FAQ</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Common questions</h2>
      </Reveal>
      <Reveal delay={80}>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 sm:px-8">
          {FAQS.map((item, i) => (
            <FAQItem key={item.q} item={item} open={open === i} onClick={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote: "We used to spend the first ten minutes of every lecture on roll call. Now it happens before students have finished sitting down.",
    name: "Dr. S. Karki",
    role: "Head of Department, Computer Engineering",
  },
  {
    quote: "Proxy attendance was a real problem in large sections. The face verification closed that gap almost entirely.",
    name: "P. Adhikari",
    role: "Assistant Professor, Electronics",
  },
  {
    quote: "End-of-semester attendance reconciliation used to take our office a full week. It's now a report we generate in seconds.",
    name: "N. Maharjan",
    role: "Academic Administrator",
  },
];

function Testimonials() {
  const [i, setI] = useState(0);
  const go = useCallback((dir) => setI((v) => (v + dir + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => {
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go]);

  const item = TESTIMONIALS[i];

  return (
    <section className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-12">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">From the field</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">What departments say after switching</h2>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 max-w-3xl">
          <div className="flex gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="mb-8 text-lg leading-relaxed sm:text-xl text-slate-200">&ldquo;{item.quote}&rdquo;</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-medium text-white">{item.name}</p>
              <p className="text-[13px] text-slate-500">{item.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => go(-1)} className="flex items-center justify-center transition-colors border rounded-full w-9 h-9 border-white/10 text-slate-400 hover:text-white hover:border-white/25" aria-label="Previous testimonial">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => go(1)} className="flex items-center justify-center transition-colors border rounded-full w-9 h-9 border-white/10 text-slate-400 hover:text-white hover:border-white/25" aria-label="Next testimonial">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const COMPARE_ROWS = [
  ["Speed", "5–10 min per class", "Under 1 second"],
  ["Accuracy", "Prone to proxies", "99.6% verified"],
  ["Security", "Paper, easily altered", "Encrypted, audit-logged"],
  ["Automation", "Fully manual", "Fully automatic"],
  ["Reporting", "Built by hand, monthly", "Live, always current"],
  ["Scalability", "Breaks down past 1 section", "Same system, any number of sections"],
];

function WhyChoose() {
  return (
    <section className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-14">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">Side by side</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Traditional systems vs. AttendEase</h2>
      </Reveal>

      <Reveal>
        <div className="overflow-hidden border rounded-2xl border-white/10">
          <div className="grid grid-cols-3 bg-white/[0.03] text-[12px] font-mono uppercase tracking-wider text-slate-500">
            <div className="px-5 py-4 sm:px-7">Criteria</div>
            <div className="px-5 py-4 border-l sm:px-7 border-white/10">Traditional</div>
            <div className="px-5 py-4 text-blue-400 border-l sm:px-7 border-white/10">AttendEase</div>
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div key={row[0]} className={`grid grid-cols-3 ${i !== COMPARE_ROWS.length - 1 ? "border-b border-white/10" : ""}`}>
              <div className="px-5 sm:px-7 py-4 text-[13.5px] font-medium text-white flex items-center">{row[0]}</div>
              <div className="px-5 sm:px-7 py-4 border-l border-white/10 text-[13.5px] text-slate-500 flex items-center gap-2">
                <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                {row[1]}
              </div>
              <div className="px-5 sm:px-7 py-4 border-l border-white/10 bg-blue-500/[0.03] text-[13.5px] text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                {row[2]}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

const AI_CARDS = [
  {
    icon: ScanFace,
    title: "YOLOv8",
    tag: "Detection",
    desc: "A single-pass object detector locates every face in a frame in milliseconds, holding up in group shots and off-angle seating.",
  },
  {
    icon: Fingerprint,
    title: "FaceNet",
    tag: "Recognition",
    desc: "Each face is mapped to a 128-dimension embedding and matched against enrolled students by embedding distance.",
  },
  {
    icon: Gauge,
    title: "Confidence scoring",
    tag: "Verification",
    desc: "Matches below the confidence threshold are held for manual review instead of silently marking attendance.",
  },
];

function AITechnology() {
  return (
    <section id="technology" className="border-y border-white/10 bg-white/[0.015]">
      <div className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
        <Reveal className="max-w-xl mb-14">
          <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">Under the hood</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">The pipeline behind every mark</h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-3">
          {AI_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="h-full border rounded-2xl border-white/10 bg-slate-950/60 p-7">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center border w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-400/10 border-white/10">
                    <c.icon className="w-5 h-5 text-cyan-300" />
                  </div>
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-slate-500 px-2 py-1 rounded-full border border-white/10">
                    {c.tag}
                  </span>
                </div>
                <h3 className="text-[16px] font-medium text-white mb-2.5">{c.title}</h3>
                <p className="text-[13.5px] text-slate-500 leading-relaxed">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const DASH_TABS = {
  Admin: {
    stat: [["Sections", "42"], ["Faculty", "68"], ["Avg. attendance", "94.1%"]],
    rows: [["CS301 · Data Structures", "38/40", "95%"], ["EE204 · Circuits II", "31/34", "91%"], ["ME110 · Thermodynamics", "44/46", "96%"]],
  },
  Teacher: {
    stat: [["My sections", "4"], ["Today's classes", "2"], ["Flagged absences", "3"]],
    rows: [["Aashik Regmi", "Present", "09:14"], ["Bina Shrestha", "Present", "09:15"], ["Kiran Thapa", "Absent", "—"]],
  },
  Student: {
    stat: [["Overall attendance", "92%"], ["Classes this week", "12"], ["Streak", "6 days"]],
    rows: [["Data Structures", "Present", "Today"], ["Circuits II", "Present", "Today"], ["Thermodynamics", "Present", "Yesterday"]],
  },
};

function DashboardPreview() {
  const [tab, setTab] = useState("Admin");
  const data = DASH_TABS[tab];
  return (
    <section className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-10">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">See it in action</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">One product, three vantage points</h2>
      </Reveal>

      <Reveal delay={80}>
        <div className="inline-flex p-1 rounded-lg border border-white/10 bg-white/[0.02] mb-8">
          {Object.keys(DASH_TABS).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                tab === t ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-hidden border shadow-2xl rounded-2xl border-white/10 bg-slate-900 shadow-black/40">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="ml-3 text-[11.5px] font-mono text-slate-500">app.attendease.io/{tab.toLowerCase()}</span>
          </div>
          <div className="p-6 sm:p-8">
            <div className="grid gap-4 mb-6 sm:grid-cols-3">
              {data.stat.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <p className="text-[11px] font-mono uppercase text-slate-500 mb-2">{label}</p>
                  <p className="font-mono text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-hidden border rounded-xl border-white/10">
              {data.rows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 px-4 py-3 text-[13px] ${i !== data.rows.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <span className="text-slate-200">{row[0]}</span>
                  <span className={row[1] === "Absent" ? "text-rose-400" : "text-emerald-400"}>{row[1]}</span>
                  <span className="font-mono text-right text-slate-500">{row[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const FEATURES = [
  { icon: ScanFace, title: "Face recognition", desc: "Multi-angle detection that keeps working in real classroom lighting and group seating." },
  { icon: BarChart3, title: "Smart analytics", desc: "Attendance trends, at-risk students, and per-course patterns surfaced automatically." },
  { icon: LayoutDashboard, title: "Attendance dashboard", desc: "A single live view of who's present, across every section you teach." },
  { icon: GraduationCap, title: "Student management", desc: "Enroll, edit, and organize student records without touching a spreadsheet." },
  { icon: Users, title: "Faculty portal", desc: "Each instructor gets a scoped view limited to their own classes and rosters." },
  { icon: Cloud, title: "Cloud storage", desc: "Encrypted, backed-up records accessible from any device, any campus." },
  { icon: Lock, title: "Role-based access", desc: "Admins, faculty, and students each see exactly what they're meant to." },
  { icon: ShieldAlert, title: "Fraud detection", desc: "Liveness checks and anti-spoofing catch photo and video proxy attempts." },
];

function FeatureCard({ f, delay }) {
  return (
    <Reveal delay={delay}>
      <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300">
        <div className="flex items-center justify-center w-10 h-10 mb-5 rounded-lg bg-blue-500/10">
          <f.icon className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-[15px] font-medium text-white mb-2">{f.title}</h3>
        <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">{f.desc}</p>
        <a href="#" className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-400 group-hover:text-blue-400 transition-colors">
          Learn more
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </Reveal>
  );
}

function Features() {
  return (
    <section id="features" className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-14">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">Core features</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Everything a department needs, nothing it doesn't</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} f={f} delay={(i % 4) * 70} />
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { n: "01", icon: Camera, title: "Capture face", desc: "The classroom camera captures a frame as students take their seats." },
  { n: "02", icon: ScanFace, title: "AI detection", desc: "YOLOv8 locates every face in frame, even at odd angles or in groups." },
  { n: "03", icon: Fingerprint, title: "Face verification", desc: "FaceNet embeddings match each face against enrolled student records." },
  { n: "04", icon: CheckCircle2, title: "Attendance recorded", desc: "A confidence-scored entry is written to the database in real time." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-16">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">How it works</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Four steps, under a second
        </h2>
      </Reveal>

      <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-white/0 via-white/15 to-white/0" />
        {STEPS.map((s, i) => (
          <Reveal key={s.n} delay={i * 90}>
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative z-10 flex items-center justify-center w-12 h-12 border rounded-xl border-white/10 bg-slate-900">
                  <s.icon className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-[13px] font-mono text-slate-600">{s.n}</span>
              </div>
              <h3 className="text-[15px] font-medium text-white mb-2">{s.title}</h3>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PROBLEMS = [
  "Proxy attendance goes undetected for entire semesters",
  "Paper registers and spreadsheets that don't reconcile",
  "10+ minutes of every class lost to a manual roll call",
  "Human error in transcription skews attendance records",
];

const SOLUTIONS = [
  "AI face recognition confirms the actual person is present",
  "Every entry lands in a single, queryable database",
  "Attendance is marked automatically the moment class starts",
  "Confidence-scored verification, logged with a timestamp",
];

function ProblemSolution() {
  return (
    <section className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-14">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">Why institutions switch</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Manual attendance breaks down. This doesn't.
        </h2>
      </Reveal>

      <div className="grid gap-5 md:grid-cols-2">
        <Reveal className="rounded-2xl border border-white/10 bg-white/[0.015] p-7 sm:p-8">
          <p className="text-[12px] font-mono uppercase tracking-wider text-slate-500 mb-6">The old way</p>
          <ul className="space-y-4">
            {PROBLEMS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14.5px] text-slate-400 leading-relaxed">
                <XCircle className="w-4.5 h-4.5 text-slate-600 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100} className="rounded-2xl border border-blue-400/20 bg-blue-500/[0.04] p-7 sm:p-8">
          <p className="text-[12px] font-mono uppercase tracking-wider text-blue-400 mb-6">With AttendEase</p>
          <ul className="space-y-4">
            {SOLUTIONS.map((s) => (
              <li key={s} className="flex items-start gap-3 text-[14.5px] text-slate-200 leading-relaxed">
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, target, suffix = "", label, decimals = 0, prefix = "" }) {
  const [ref, inView] = useInView();
  const value = useCountUp(target, inView);
  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 hover:bg-white/[0.035] transition-colors">
      <Icon className="w-4.5 h-4.5 text-blue-400 mb-5" />
      <p className="text-3xl sm:text-[2.25rem] font-semibold text-white font-mono tracking-tight">
        {prefix}{value.toFixed(decimals)}{suffix}
      </p>
      <p className="text-[13.5px] text-slate-500 mt-2">{label}</p>
    </div>
  );
}

function Stats() {
  return (
    <section className="px-5 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-24">
      <Reveal className="max-w-xl mb-12">
        <p className="text-[13px] font-mono uppercase tracking-wider text-blue-400 mb-3">By the numbers</p>
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Performance that holds up at scale</h2>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gauge} target={99.6} suffix="%" decimals={1} label="Recognition accuracy" />
        <StatCard icon={Database} target={1000} suffix="+" label="Attendance records logged" />
        <StatCard icon={Zap} target={1} prefix="<" suffix="s" label="Real-time processing" />
        <StatCard icon={Cloud} target={24} suffix="/7" label="Cloud availability" />
      </div>
    </section>
  );
}

function TechStrip() {
  return (
    <section className="border-y border-white/10 bg-white/[0.015]">
      <div className="px-5 py-10 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-[12px] font-mono uppercase tracking-wider text-slate-500 mb-6">
            The stack running underneath
          </p>
        </Reveal>
        <Reveal delay={60}>
          <div className="flex flex-wrap justify-center gap-2.5">
            {TECH.map((t) => (
              <span
                key={t}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-[12.5px] font-mono text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] transition-colors cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Sparkle() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-cyan-300">
      <path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z" fill="currentColor" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div id="top" className="min-h-screen antialiased bg-slate-950 text-slate-100">
      <GlobalStyle />
      <Navbar />
      <Hero />
      <TechStrip />
      <Stats />
      <ProblemSolution />
      <HowItWorks />
      <Features />
      <DashboardPreview />
      <AITechnology />
      <WhyChoose />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @keyframes scanline {
        0% { transform: translateY(0%); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(148px); opacity: 0; }
      }
      @keyframes float-slow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes float-slower {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-6px) rotate(0.4deg); }
      }
      @keyframes pulse-ring {
        0% { box-shadow: 0 0 0 0 rgba(56,189,248,0.35); }
        100% { box-shadow: 0 0 0 10px rgba(56,189,248,0); }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }
      html { scroll-behavior: smooth; }
    `}</style>
  );
}