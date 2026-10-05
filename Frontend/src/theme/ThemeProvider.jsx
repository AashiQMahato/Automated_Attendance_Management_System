import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { MotionConfig } from "framer-motion";
import { palette } from "./tokens";

const STORAGE_KEY = "dashboard-theme";
const ThemeContext = createContext(null);

const readPreference = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
};

const systemPrefersDark = () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

const buildAntdTheme = (mode) => {
  const p = palette[mode];
  return {
    algorithm: mode === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: p.brand,
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
      borderRadius: 10,
      borderRadiusLG: 16,
      controlHeight: 38,
      fontSize: 14,
      fontFamily: '"Geist Variable", Geist, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      boxShadowSecondary: "0 12px 32px -8px rgb(15 23 42 / 0.16), 0 4px 8px -4px rgb(15 23 42 / 0.06)",
      motionDurationMid: "0.2s",
    },
    components: {
      Modal: { contentBg: p.surface, headerBg: p.surface, titleFontSize: 16 },
      Drawer: { colorBgElevated: p.surface },
      Table: { headerBg: p.surface2, headerColor: p.ink3, rowHoverBg: p.surface2, borderColor: p.line },
      Select: { optionSelectedBg: mode === "dark" ? "rgba(96,165,250,0.14)" : "#EFF6FF" },
      Button: { primaryShadow: "none", defaultShadow: "none" },
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

  // The class lives on <html> so antd portals (modals, dropdowns) also get
  // the right tokens. It is removed when the dashboard unmounts, keeping the
  // public pages unaffected.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    return () => root.classList.remove("dark");
  }, [resolved]);

  const antdConfig = useMemo(() => buildAntdTheme(resolved), [resolved]);

  // Static antd APIs (message.success, etc.) render outside the React tree;
  // route them through the same theme.
  useEffect(() => {
    ConfigProvider.config({
      holderRender: (children) => <ConfigProvider theme={antdConfig}>{children}</ConfigProvider>,
    });
  }, [antdConfig]);

  const setPreference = (next) => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 250);
    setPreferenceState(next);
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: preference lasts for this session only */
    }
  };

  const value = useMemo(() => ({ preference, resolved, setPreference, colors: palette[resolved] }), [preference, resolved]);

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={antdConfig}>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
};
