import React from "react";
import { motion } from "framer-motion";

// Gradient welcome banner. Colors come from the role tokens (--hero-*), so the
// student and teacher dashboards share one component with distinct identities.
// `aside` renders on the right on wide screens (e.g. a progress ring).
const HeroBanner = ({ eyebrow, title, description, chips, actions, aside }) => (
  <motion.section
    initial={{ opacity: 0, y: 12, scale: 0.99 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
    className="bg-hero relative overflow-hidden rounded-3xl px-5 py-6 text-white shadow-[0_20px_40px_-20px_rgb(79_70_229/0.6)] sm:px-8 sm:py-8"
  >
    {/* Decorative layers: dotted grid + soft orbs */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.14]"
      style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.9) 1px, transparent 1px)", backgroundSize: "18px 18px" }}
      aria-hidden="true"
    />
    <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
    <div
      className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-fuchsia-300/20 blur-3xl"
      aria-hidden="true"
    />

    <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[13px] font-medium text-white/75">{eyebrow}</p>}
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-[-0.03em] sm:text-[32px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-[15px] text-white/80">{description}</p>}
        {chips && <div className="mt-4 flex flex-wrap items-center gap-2">{chips}</div>}
        {actions && <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {aside && <div className="hidden shrink-0 sm:block">{aside}</div>}
    </div>
  </motion.section>
);

// Translucent pill for use on the hero.
export const HeroChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[13px] font-medium text-white ring-1 ring-inset ring-white/20 backdrop-blur">
    {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
    {children}
  </span>
);

export default HeroBanner;
