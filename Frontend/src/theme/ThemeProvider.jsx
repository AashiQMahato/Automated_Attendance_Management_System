import { useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { MotionConfig } from "framer-motion";
import { palette, THEME_STORAGE_KEY } from "./tokens";
import { ThemeContext } from "./useTheme";

const readPreference = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

const systemPrefersDark = () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

// antd draws its own surfaces; we hand it the same tokens and let CSS in
// index.css turn its pop-ups (modals, pickers, messages) into glass.
const buildAntdTheme = (mode) => {
  const p = palette[mode];
  return {
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: mode === "dark" ? p.brand : "#5267E8",
      colorInfo: p.brand,
      colorSuccess: p.success,
      colorWarning: p.warning,
      colorError: p.danger,
      colorText: p.ink,
      colorTextSecondary: p.ink2,
      colorTextTertiary: p.ink3,
      colorTextPlaceholder: p.ink3,
      colorBorder: p.lineStrong,
      colorBorderSecondary: p.line,
      colorSplit: p.line,
      colorBgContainer: p.surface,
      colorBgElevated: p.surface,
      colorBgLayout: p.canvas,
      colorFillAlter: p.surface2,
      borderRadius: 12,
      borderRadiusLG: 20,
      borderRadiusSM: 8,
      controlHeight: 40,
      fontSize: 14,
      fontFamily: '"Geist Variable", Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      boxShadowSecondary: "0 24px 60px -16px rgb(16 24 39 / 0.28), 0 6px 14px -6px rgb(16 24 39 / 0.12)",
      motionDurationMid: "0.2s",
      motionEaseOut: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
    components: {
      Modal: { contentBg: p.surface, headerBg: "transparent", footerBg: "transparent", titleFontSize: 17 },
      Drawer: { colorBgElevated: p.surface },
      Table: { headerBg: p.surface2, headerColor: p.ink3, rowHoverBg: p.surface2, borderColor: p.line },
      Select: { optionSelectedBg: mode === "dark" ? "rgba(129,146,245,0.16)" : "#EEF1FD" },
      DatePicker: { cellActiveWithRangeBg: mode === "dark" ? "rgba(129,146,245,0.16)" : "#EEF1FD" },
      Button: { primaryShadow: "none", defaultShadow: "none", fontWeight: 500 },
      Message: { contentBg: p.surface },
    },
  };
};

export const ThemeProvider = ({ children }) => {
  const [preference, setPreferenceState] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // The class lives on <html> so antd portals (modals, dropdowns) also get the
  // right tokens. index.html applies it before first paint (no flash).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", palette[resolved].canvas);
  }, [resolved]);

  const antdConfig = useMemo(() => buildAntdTheme(resolved), [resolved]);

  // Static antd APIs (message.success, etc.) render outside the React tree;
  // route them through the same theme.
  useEffect(() => {
    ConfigProvider.config({
      holderRender: (children) => <ConfigProvider theme={antdConfig}>{children}</ConfigProvider>,
    });
  }, [antdConfig]);

  const value = useMemo(() => {
    const setPreference = (next) => {
      const root = document.documentElement;
      root.classList.add("theme-transition");
      window.setTimeout(() => root.classList.remove("theme-transition"), 250);
      setPreferenceState(next);
      try {
        if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
        else localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* storage unavailable: preference lasts for this session only */
      }
    };
    return { preference, resolved, setPreference, colors: palette[resolved] };
  }, [preference, resolved]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdConfig}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
