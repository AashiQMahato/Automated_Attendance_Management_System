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
        success: token("success"),
        warning: token("warning"),
        danger: token("danger"),
      },
      fontFamily: {
        ui: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Segoe UI"',
          "Inter",
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(17 19 43 / 0.05)",
        card: "0 1px 2px 0 rgb(17 19 43 / 0.04), 0 8px 24px -12px rgb(17 19 43 / 0.08)",
        lift: "0 2px 4px -1px rgb(17 19 43 / 0.05), 0 16px 32px -12px rgb(79 70 229 / 0.18)",
        pop: "0 16px 40px -12px rgb(17 19 43 / 0.22), 0 4px 10px -4px rgb(17 19 43 / 0.08)",
      },
      transitionTimingFunction: {
        // Close to Apple's default ease-out; used for UI state transitions.
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};
