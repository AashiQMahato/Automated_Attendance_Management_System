import React from "react";
import { initials } from "../../lib/format";
import { colorFor, colors } from "./colors";

const sizes = { sm: "h-7 w-7 text-[11px]", md: "h-9 w-9 text-xs", lg: "h-11 w-11 text-sm" };

// Initials on a tint picked from the name, so people stay recognizable.
const Avatar = ({ name, src, size = "md", className = "" }) =>
  src ? (
    <img src={src} alt="" className={`shrink-0 rounded-full object-cover ring-2 ring-surface ${sizes[size]} ${className}`} />
  ) : (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${colors[colorFor(name)].tile} ${sizes[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );

export default Avatar;
