/** @type {import('tailwindcss').Config} */

// Dashboard design tokens are CSS variables (see src/index.css) holding RGB
// channels, so every token supports Tailwind's opacity modifier (bg-brand/10).
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        ink: token("ink"),
        "ink-2": token("ink-2"),
        "ink-3": token("ink-3"),
        line: token("line"),
        "line-strong": token("line-strong"),
        brand: token("brand"),
        "brand-2": token("brand-2"),
        "brand-fg": token("brand-fg"),
        accent: token("accent"),
        "accent-2": token("accent-2"),
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
      },
      fontFamily: {
        // Geist everywhere (self-hosted via @fontsource-variable, see main.jsx).
        sans: ['"Geist Variable"', "Geist", "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        ui: ['"Geist Variable"', "Geist", "ui-sans-serif", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        mono: ['"Geist Mono Variable"', '"Geist Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(16 24 39 / 0.05)",
        card: "var(--glass-shadow)",
        lift: "inset 0 1px 0 0 rgb(var(--glass-edge) / var(--glass-edge-a)), var(--glass-shadow-lift)",
        pop: "var(--glass-shadow-pop)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        control: "var(--radius-control)",
      },
      transitionTimingFunction: {
        // Close to Apple's default ease-out; used for UI state transitions.
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      keyframes: {
        "scan-line": {
          "0%": { transform: "translateY(-10%)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translateY(1000%)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
        "scan-line": "scan-line 2.2s cubic-bezier(0.4,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
