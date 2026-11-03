import { useRef, useState } from "react";
import { message } from "antd";
import { Camera, KeyRound, Loader2, Monitor, Moon, Palette, Settings as SettingsIcon, Sun, UserRound } from "lucide-react";
import store from "../../../zustand/loginStore";
import { useTheme } from "../../../theme/useTheme";
import api from "../../../lib/api";
import { heicToJpeg, isHeic, isImageFile } from "../../../lib/heic";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import Field, { inputClass } from "../../ui/Field";
import Select from "../../ui/Select";
import { SEMESTER_OPTIONS } from "../../../lib/format";
import SegmentedControl from "../../ui/SegmentedControl";
import { Card, CardHeader } from "../../ui/Card";
import { colors as palette } from "../../ui/colors";

const MIN_PASSWORD = 8;
const errorText = (err, fallback) => err.response?.data?.message || fallback;

const SectionFooter = ({ children }) => <div className="flex justify-end border-t border-line px-5 py-3.5 sm:px-6">{children}</div>;

const ProfileSection = ({ user, updateUserProfile }) => {
  const fileRef = useRef(null);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [semester, setSemester] = useState(user.semester?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isAdmin = user.role === "Admin";
  const changed = fullName.trim() !== user.fullName || (!isAdmin && semester !== user.semester?.toString());

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/users/update-profile", { fullName: fullName.trim(), ...(isAdmin ? {} : { semester: Number(semester) }) });
      updateUserProfile(data.data);
      message.success("Profile saved");
    } catch (err) {
      message.error(errorText(err, "Couldn't save your profile"));
    } finally {
      setSaving(false);
    }
  };

  const changePhoto = async (picked) => {
    if (!picked) return;
    if (!isImageFile(picked)) return message.error("Please choose a JPG, PNG or HEIC photo");
    setUploading(true);
    try {
      const file = isHeic(picked) ? await heicToJpeg(picked) : picked;
      if (file.size > 10 * 1024 * 1024) throw new Error("too-big");
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await api.post("/users/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateUserProfile({ avatar: data.data.avatar });
      message.success("Photo updated");
    } catch (err) {
      message.error(err.message === "too-big" ? "Photos must be 10MB or smaller" : errorText(err, "Couldn't update your photo"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card as="form" onSubmit={save} aria-labelledby="settings-profile">
      <CardHeader id="settings-profile" icon={UserRound} iconTile={palette.indigo.tile} title="Profile" description="How you appear across AttendEase." />
      <div className="flex items-center gap-4 px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile photo"
          className="focus-ring group relative shrink-0 rounded-full"
        >
          <Avatar name={user.fullName} src={user.avatar} size="lg" className="!h-16 !w-16 !text-lg" />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 data-[busy=true]:opacity-100" data-busy={uploading}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Camera className="h-5 w-5" aria-hidden="true" />}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            changePhoto(e.target.files[0]);
            e.target.value = "";
          }}
        />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold tracking-[-0.01em] text-ink">{user.fullName}</p>
          <p className="truncate text-[13px] text-ink-3">
            {user.role}
            {user.semester && !isAdmin ? ` · Semester ${user.semester}` : ""}
          </p>
          <button type="button" onClick={() => fileRef.current?.click()} className="focus-ring mt-1 rounded text-[13px] font-medium text-brand hover:underline">
            Change photo
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <Field label="Full name">
          {(p) => <input {...p} required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />}
        </Field>
        {!isAdmin && (
          <Field label="Semester">
            {(p) => (
              <Select {...p} required value={semester} onChange={setSemester} options={SEMESTER_OPTIONS} />
            )}
          </Field>
        )}
        <Field label="Email" hint="Ask your admin to change it.">
          {(p) => <input {...p} value={user.email} readOnly className={`${inputClass} cursor-default bg-surface-2 text-ink-2`} />}
        </Field>
      </div>
      <SectionFooter>
        <Button type="submit" variant="primary" loading={saving} disabled={!changed || !fullName.trim()}>
          Save profile
        </Button>
      </SectionFooter>
    </Card>
  );
};

const EMPTY_PASSWORDS = { currentPassword: "", newPassword: "", confirm: "" };

const PasswordSection = () => {
  const [form, setForm] = useState(EMPTY_PASSWORDS);
  const [saving, setSaving] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const tooShort = form.newPassword && form.newPassword.length < MIN_PASSWORD;
  const mismatch = form.confirm && form.confirm !== form.newPassword;
  const ready = form.currentPassword && form.newPassword.length >= MIN_PASSWORD && form.confirm === form.newPassword;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm(EMPTY_PASSWORDS);
      message.success("Password changed");
    } catch (err) {
      message.error(errorText(err, "Couldn't change your password"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card as="form" onSubmit={save} aria-labelledby="settings-password">
      <CardHeader id="settings-password" icon={KeyRound} iconTile={palette.amber.tile} title="Password" description={`At least ${MIN_PASSWORD} characters.`} />
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
        <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
          <Field label="Current password">
            {(p) => <input {...p} type="password" autoComplete="current-password" value={form.currentPassword} onChange={set("currentPassword")} className={inputClass} />}
          </Field>
        </div>
        <Field label="New password" hint={tooShort ? `Use at least ${MIN_PASSWORD} characters.` : undefined}>
          {(p) => <input {...p} type="password" autoComplete="new-password" aria-invalid={!!tooShort} value={form.newPassword} onChange={set("newPassword")} className={inputClass} />}
        </Field>
        <Field label="Confirm new password" hint={mismatch ? "Passwords don't match." : undefined}>
          {(p) => <input {...p} type="password" autoComplete="new-password" aria-invalid={!!mismatch} value={form.confirm} onChange={set("confirm")} className={inputClass} />}
        </Field>
      </div>
      <SectionFooter>
        <Button type="submit" variant="primary" loading={saving} disabled={!ready}>
          Change password
        </Button>
      </SectionFooter>
    </Card>
  );
};

const AppearanceSection = () => {
  const { preference, setPreference } = useTheme();
  return (
    <Card aria-labelledby="settings-appearance">
      <CardHeader id="settings-appearance" icon={Palette} iconTile={palette.violet.tile} title="Appearance" description="Saved on this device." />
      <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-ink-2">Theme</p>
        <SegmentedControl
          label="Theme"
          size="md"
          value={preference}
          onChange={setPreference}
          options={[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ]}
        />
      </div>
    </Card>
  );
};

const Settings = () => {
  const { loginUserData, updateUserProfile } = store((state) => state);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader icon={SettingsIcon} color="violet" title="Settings" description="Your profile, password and appearance." />
      <ProfileSection user={loginUserData} updateUserProfile={updateUserProfile} />
      <PasswordSection />
      <AppearanceSection />
    </div>
  );
};

export default Settings;
