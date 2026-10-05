import React from "react";
import { initials } from "../../lib/format";

const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-8 w-8 text-xs", lg: "h-10 w-10 text-sm" };

const Avatar = ({ name, src, size = "md", accent = true, className = "" }) =>
  src ? (
    <img src={src} alt="" className={`shrink-0 rounded-full object-cover ${sizes[size]} ${className}`} />
  ) : (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${
        accent ? "bg-accent/10 text-accent" : "bg-surface-2 text-ink-2"
      } ${sizes[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );

export default Avatar;
