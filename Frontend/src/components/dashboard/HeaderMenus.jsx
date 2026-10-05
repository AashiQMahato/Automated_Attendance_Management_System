import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarRange, LogOut, Monitor, Moon, Settings, Sun } from "lucide-react";
import Popover from "../ui/Popover";
import Avatar from "../ui/Avatar";
import SegmentedControl from "../ui/SegmentedControl";
import { useTheme } from "../../theme/ThemeProvider";
import api from "../../lib/api";
import { dayjs } from "../../lib/format";

const iconButton =
  "focus-ring relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink";

export const ThemeToggle = () => {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button type="button" onClick={() => setPreference(next)} aria-label={`Switch to ${next} mode`} className={iconButton}>
      {resolved === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
};

const SEEN_KEY = "announcements-seen-at";

// Announcements are the institution's holidays — the only broadcast data the
// backend provides. Unread state is per browser.
export const NotificationsMenu = ({ holidaysPath }) => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [seenAt, setSeenAt] = useState(() => {
    try {
      return Number(localStorage.getItem(SEEN_KEY)) || 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let cancelled = false;
    api
      .get("/holidays")
      .then(({ data }) => !cancelled && setHolidays(data?.data || []))
      .catch(() => {}); // Non-critical: the bell just shows nothing.
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () =>
      holidays
        .filter((h) => dayjs(h.endDate).isAfter(dayjs().startOf("day")))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 6),
    [holidays],
  );
  const unread = items.filter((h) => new Date(h.createdAt || 0).getTime() > seenAt).length;

  const markSeen = () => {
    const now = Date.now();
    setSeenAt(now);
    try {
      localStorage.setItem(SEEN_KEY, String(now));
    } catch {
      /* ignore */
    }
  };

  return (
    <Popover
      label="Announcements"
      width="w-80"
      trigger={({ onClick, ...props }) => (
        <button
          type="button"
          {...props}
          onClick={() => {
            onClick();
            if (unread) markSeen();
          }}
          aria-label={unread ? `Announcements, ${unread} new` : "Announcements"}
          className={iconButton}
        >
          <Bell className="h-[18px] w-[18px]" />
          {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-canvas" aria-hidden="true" />}
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold text-ink">Announcements</p>
            <span className="text-xs text-ink-3">{items.length ? `${items.length} upcoming` : ""}</span>
          </div>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm font-medium text-ink">You're all caught up</p>
              <p className="mt-1 text-xs text-ink-3">New holiday announcements will appear here.</p>
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1 scrollbar-thin">
              {items.map((h) => {
                const ongoing = dayjs().isAfter(dayjs(h.startDate));
                return (
                  <li key={h._id}>
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        navigate(holidaysPath);
                      }}
                      className="focus-ring flex w-full gap-3 px-4 py-2.5 text-left hover:bg-surface-2"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                        <CalendarRange className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink">{h.title}</span>
                        <span className="block text-xs text-ink-3">
                          {ongoing ? "Ongoing · ends " : ""}
                          {dayjs(ongoing ? h.endDate : h.startDate).format("ddd, MMM D")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
};

export const ProfileMenu = ({ user, settingsPath, onLogout }) => {
  const navigate = useNavigate();
  const { preference, setPreference } = useTheme();
  return (
    <Popover
      label="Account"
      width="w-72"
      trigger={(props) => (
        <button type="button" {...props} aria-label="Account menu" className="focus-ring rounded-full">
          <Avatar name={user.fullName} src={user.avatar} size="md" />
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <Avatar name={user.fullName} src={user.avatar} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-xs text-ink-3">{user.email}</p>
              <p className="mt-0.5 text-xs font-medium text-accent">
                {user.role}
                {user.role === "Student" && user.semester ? ` · Semester ${user.semester}` : ""}
              </p>
            </div>
          </div>
          <div className="border-b border-line px-4 py-3">
            <p className="mb-2 text-xs font-medium text-ink-3">Appearance</p>
            <SegmentedControl
              label="Appearance"
              value={preference}
              onChange={setPreference}
              options={[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "Auto", icon: Monitor },
              ]}
            />
          </div>
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => {
                close();
                navigate(settingsPath);
              }}
              className="focus-ring flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Profile & settings
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                onLogout();
              }}
              className="focus-ring flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-2 hover:bg-danger/10 hover:text-danger"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
};
