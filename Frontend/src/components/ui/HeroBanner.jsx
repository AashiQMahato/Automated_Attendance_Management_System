import { motion } from "framer-motion";

/*
  Overview hero for each role. A deep role-tinted gradient (--hero-* tokens)
  under a layer of liquid glass: a specular top edge, a refraction ring and
  two soft light blooms. White text sits on stops chosen for >= 5:1 contrast.
  `aside` renders on the right on wide screens (e.g. a progress ring).
*/
const HeroBanner = ({ eyebrow, title, description, chips, actions, aside }) => (
  <motion.section
    initial={{ opacity: 0, y: 12, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", bounce: 0, duration: 0.65 }}
    className="bg-hero relative isolate overflow-hidden rounded-[28px] px-5 py-6 text-white shadow-[0_30px_60px_-30px_rgb(var(--hero-via)/0.75),inset_0_1px_0_0_rgb(255_255_255/0.35)] sm:px-8 sm:py-8"
  >
    {/* Liquid glass layers */}
    <div
      className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(255_255_255/0.16)_0%,rgb(255_255_255/0)_38%)]"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -right-24 -top-32 -z-10 h-[340px] w-[340px] rounded-full border border-white/20 bg-[radial-gradient(closest-side,rgb(255_255_255/0.2),rgb(255_255_255/0.02)_70%,transparent)]"
      aria-hidden="true"
    />
    <div
      className="pointer-events-none absolute -bottom-40 left-[28%] -z-10 h-[300px] w-[300px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--hero-to)/0.55),transparent)]"
      aria-hidden="true"
    />
    <div className="pointer-events-none absolute inset-0 -z-10 rounded-[28px] ring-1 ring-inset ring-white/15" aria-hidden="true" />

    <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[13px] font-medium text-white/80">{eyebrow}</p>}
        <h1 className="mt-1 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] sm:text-[34px]">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-[15px] leading-6 text-white/85">{description}</p>}
        {chips && <div className="mt-4 flex flex-wrap items-center gap-2">{chips}</div>}
        {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {aside && <div className="hidden shrink-0 sm:block">{aside}</div>}
    </div>
  </motion.section>
);

// Translucent glass pill for use on the hero.
export const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3 py-1 text-[13px] font-medium text-white shadow-[inset_0_1px_0_0_rgb(255_255_255/0.2)] ring-1 ring-inset ring-white/25 backdrop-blur-md">
    {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
    {children}
  </span>
);

// Frosted tile for the hero's right side (rings, summaries).
export const HeroAside = ({ children }) => (
  <div className="flex items-center gap-4 rounded-[22px] bg-white/[0.12] p-4 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.3)] ring-1 ring-inset ring-white/20 backdrop-blur-xl lg:flex-col lg:px-6 lg:py-5">
    {children}
  </div>
);

export default HeroBanner;
