import { useState } from "react";
import { Form, Input, Select, Upload, message } from "antd";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  KeyRound,
  Loader2,
  Mail,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Sun,
  UserRound,
} from "lucide-react";
import store from "../../../zustand/loginStore";
import { useTheme } from "../../../theme/ThemeProvider";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import { Card, CardHeader } from "../../ui/Card";
import { colors as palette } from "../../ui/colors";

const sections = [
  { id: "profile", label: "Profile", icon: UserRound, color: "indigo" },
  { id: "security", label: "Security", icon: KeyRound, color: "amber" },
  { id: "appearance", label: "Appearance", icon: Palette, color: "violet" },
];

// 0–4 score used only for the visual strength meter.
const passwordScore = (pw = "") => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s += 1;
  if (pw.length >= 10) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s += 1;
  return s;
};
const strength = [
  { label: "Too short", bar: "bg-line-strong", text: "text-ink-3" },
  { label: "Weak", bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-300" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  { label: "Good", bar: "bg-sky-500", text: "text-sky-700 dark:text-sky-300" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
];

const ThemeOption = ({ value, label, icon: Icon, active, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={() => onSelect(value)}
    className={`focus-ring group relative overflow-hidden rounded-2xl border p-3 text-left transition-[border-color,box-shadow] ${
      active ? "border-brand shadow-[0_0_0_3px_rgb(var(--brand)/0.15)]" : "border-line hover:border-line-strong"
    }`}
  >
    {/* Mini preview of the theme */}
    <div
      className={`mb-3 flex h-20 gap-1.5 overflow-hidden rounded-xl p-1.5 ${
        value === "dark"
          ? "bg-[#090B16]"
          : value === "light"
            ? "bg-[#F4F6FB]"
            : "bg-gradient-to-r from-[#F4F6FB] from-50% to-[#090B16] to-50%"
      }`}
      aria-hidden="true"
    >
      <div className={`w-1/4 rounded-md ${value === "dark" ? "bg-[#111427]" : "bg-white"}`} />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="bg-brand-gradient h-5 rounded-md" />
        <div
          className={`flex-1 rounded-md ${value === "dark" ? "bg-[#111427]" : value === "light" ? "bg-white" : "bg-gradient-to-r from-white from-[38%] to-[#111427] to-[38%]"}`}
        />
      </div>
    </div>
    <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
      <Icon className="h-4 w-4 text-ink-3" aria-hidden="true" />
      {label}
      {active && (
        <span className="bg-brand-gradient ml-auto flex h-5 w-5 items-center justify-center rounded-full text-white">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      )}
    </span>
  </button>
);

const Settings = () => {
  const { loginUserData } = store((state) => state);
  const { preference, setPreference } = useTheme();
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(loginUserData.avatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [active, setActive] = useState("profile");
  const password = Form.useWatch("password", form);
  const score = passwordScore(password);

  // Unchanged behavior: validates the form and confirms locally.
  const handleSaveChanges = () => {
    setSaving(true);
    setTimeout(() => {
      form
        .validateFields()
        .then(() => {
          setSaving(false);
          setDirty(false);
          message.success("Settings saved");
        })
        .catch(() => {
          setSaving(false);
          message.error("Please check the form for errors");
        });
    }, 800);
  };

  const initialValues = {
    ...loginUserData,
    semester: loginUserData.semester?.toString(),
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) message.error("You can only upload JPG/PNG files");
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) message.error("Image must be smaller than 2MB");
    return isJpgOrPng && isLt2M;
  };

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setUploading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj, (url) => {
        setImageUrl(url);
        setUploading(false);
      });
    }
    if (info.file.status === "error") setUploading(false);
  };

  const scrollTo = (id) => {
    setActive(id);
    document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const label = (text) => <span className="text-[13px] font-medium text-ink-2">{text}</span>;

  const avatarUpload = (
    <Upload
      name="avatar"
      showUploadList={false}
      action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      <button type="button" className="focus-ring group relative rounded-full" aria-label="Change profile photo">
        <Avatar name={loginUserData.fullName} src={imageUrl} size="lg" className="!h-20 !w-20 !text-xl ring-4 ring-surface" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        </span>
        <span className="bg-brand-gradient absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full text-white ring-2 ring-surface">
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
    </Upload>
  );

  return (
    <div className="space-y-4">
      <PageHeader icon={SettingsIcon} color="violet" title="Settings" description="Manage your profile, security and appearance." />

      <div className="grid items-start gap-4 lg:grid-cols-[280px,minmax(0,1fr)]">
        {/* Summary + section navigation */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="overflow-hidden">
            <div className="bg-hero relative h-20" aria-hidden="true">
              <div
                className="absolute inset-0 opacity-[0.15]"
                style={{ backgroundImage: "radial-gradient(rgb(255 255 255 / 0.9) 1px, transparent 1px)", backgroundSize: "14px 14px" }}
              />
            </div>
            <div className="-mt-10 flex flex-col items-center px-5 pb-5 text-center">
              {avatarUpload}
              <p className="mt-3 text-[16px] font-semibold tracking-[-0.01em] text-ink">{loginUserData.fullName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-3">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {loginUserData.email}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{loginUserData.role}</span>
                {loginUserData.semester && (
                  <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink-2">
                    Semester {loginUserData.semester}
                  </span>
                )}
              </div>
              <p className="mt-3 text-[11px] text-ink-3">Click the photo to change it · JPG or PNG, up to 2MB</p>
            </div>
          </Card>

          <Card className="p-2" reveal={false}>
            <nav aria-label="Settings sections" className="flex gap-1 overflow-x-auto lg:flex-col">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollTo(s.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`focus-ring relative flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive ? "text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="settings-nav"
                        className="absolute inset-0 rounded-xl bg-surface-2 ring-1 ring-inset ring-line"
                        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        aria-hidden="true"
                      />
                    )}
                    <span className={`relative flex h-8 w-8 items-center justify-center rounded-lg ${palette[s.color].tile}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="relative">{s.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Sections */}
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          requiredMark={false}
          onValuesChange={() => setDirty(true)}
          className="space-y-4"
        >
          <Card id="settings-profile" className="scroll-mt-24">
            <CardHeader icon={UserRound} iconTile={palette.indigo.tile} title="Profile" description="How you appear across AttendEase." />
            <div className="grid gap-x-4 px-5 pb-1 pt-5 sm:grid-cols-2 sm:px-6">
              <Form.Item
                name="fullName"
                label={label("Full name")}
                rules={[{ required: true, message: "Please input your full name", pattern: /^[A-Za-z ]+$/ }]}
              >
                <Input size="large" placeholder="John Doe" autoComplete="name" />
              </Form.Item>
              <Form.Item
                name="email"
                label={label("Email")}
                extra={<span className="text-xs text-ink-3">Contact your administrator to change it.</span>}
                rules={[{ required: true, type: "email", message: "Please input a valid email" }]}
              >
                <Input size="large" disabled prefix={<Mail className="h-4 w-4 text-ink-3" aria-hidden="true" />} />
              </Form.Item>
              <Form.Item name="semester" label={label("Semester")} rules={[{ required: true, message: "Please select your semester" }]}>
                <Select
                  size="large"
                  placeholder="Select semester"
                  options={Array.from({ length: 8 }, (_, i) => ({ value: (i + 1).toString(), label: `Semester ${i + 1}` }))}
                />
              </Form.Item>
              <Form.Item name="role" label={label("Account type")}>
                <Select
                  size="large"
                  disabled
                  options={[
                    { value: "Student", label: "Student" },
                    { value: "Teacher", label: "Teacher" },
                  ]}
                />
              </Form.Item>
            </div>
          </Card>

          <Card id="settings-security" className="scroll-mt-24">
            <CardHeader
              icon={KeyRound}
              iconTile={palette.amber.tile}
              title="Password"
              description="Use at least 6 characters. Mixing cases, numbers and symbols makes it stronger."
            />
            <div className="grid gap-x-4 px-5 pb-1 pt-5 sm:grid-cols-2 sm:px-6">
              <Form.Item
                name="password"
                label={label("New password")}
                rules={[{ min: 6, message: "Password must be at least 6 characters" }]}
                extra={
                  password ? (
                    <div className="mt-2" aria-live="polite">
                      <div className="flex gap-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((i) => (
                          <span
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? strength[score].bar : "bg-surface-2"}`}
                          />
                        ))}
                      </div>
                      <p className={`mt-1.5 text-xs font-medium ${strength[score].text}`}>{strength[score].label}</p>
                    </div>
                  ) : null
                }
              >
                <Input.Password size="large" placeholder="••••••••" autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={label("Confirm password")}
                dependencies={["password"]}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) return Promise.resolve();
                      return Promise.reject(new Error("Passwords do not match"));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" placeholder="••••••••" autoComplete="new-password" />
              </Form.Item>
            </div>
          </Card>

          <Card id="settings-appearance" className="scroll-mt-24">
            <CardHeader icon={Palette} iconTile={palette.violet.tile} title="Appearance" description="Applies instantly on this device." />
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 gap-3 px-5 pb-5 pt-5 sm:grid-cols-3 sm:px-6">
              <ThemeOption value="light" label="Light" icon={Sun} active={preference === "light"} onSelect={setPreference} />
              <ThemeOption value="dark" label="Dark" icon={Moon} active={preference === "dark"} onSelect={setPreference} />
              <ThemeOption value="system" label="Match system" icon={Monitor} active={preference === "system"} onSelect={setPreference} />
            </div>
          </Card>

          {/* Save bar */}
          <div className="glass sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/90 px-4 py-3 shadow-pop backdrop-blur-xl md:bottom-4">
            <p className="flex items-center gap-2 text-[13px] text-ink-2">
              <span className={`h-2 w-2 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-500"}`} aria-hidden="true" />
              {dirty ? "You have unsaved changes" : "All changes saved"}
            </p>
            <div className="flex gap-2">
              <Button
                icon={RotateCcw}
                aria-label="Reset changes"
                onClick={() => {
                  form.resetFields();
                  setDirty(false);
                }}
                disabled={!dirty}
              >
                <span className="hidden sm:inline">Reset</span>
              </Button>
              <Button variant="primary" icon={Save} loading={saving} onClick={handleSaveChanges}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Settings;
