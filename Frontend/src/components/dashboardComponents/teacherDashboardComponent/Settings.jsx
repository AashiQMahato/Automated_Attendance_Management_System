import React, { useState } from "react";
import { Form, Input, Select, Upload, message } from "antd";
import { Camera, Loader2, Save } from "lucide-react";
import store from "../../../zustand/loginStore";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Avatar from "../../ui/Avatar";
import StatusBadge from "../../ui/StatusBadge";
import { Card, CardHeader } from "../../ui/Card";

const Settings = () => {
  const { loginUserData } = store((state) => state);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(loginUserData.avatar);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Unchanged behavior: validates the form and confirms locally.
  const handleSaveChanges = () => {
    setSaving(true);
    setTimeout(() => {
      form
        .validateFields()
        .then(() => {
          setSaving(false);
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

  const label = (text) => <span className="text-[13px] font-medium text-ink-2">{text}</span>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and account security." />

      <Form form={form} layout="vertical" initialValues={initialValues} requiredMark={false} className="space-y-6">
        <Card>
          <CardHeader title="Profile" description="How you appear across AttendEase." />
          <div className="flex items-center gap-4 px-5 pt-5">
            <Upload
              name="avatar"
              showUploadList={false}
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              beforeUpload={beforeUpload}
              onChange={handleChange}
            >
              <button type="button" className="focus-ring group relative rounded-full" aria-label="Change profile photo">
                <Avatar name={loginUserData.fullName} src={imageUrl} size="lg" className="!h-16 !w-16 !text-lg" />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </span>
              </button>
            </Upload>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{loginUserData.fullName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge tone="accent">{loginUserData.role}</StatusBadge>
                <span className="text-xs text-ink-3">JPG or PNG, up to 2MB</span>
              </div>
            </div>
          </div>
          <div className="grid gap-x-4 px-5 pb-1 pt-5 sm:grid-cols-2">
            <Form.Item
              name="fullName"
              label={label("Full name")}
              rules={[{ required: true, message: "Please input your full name", pattern: /^[A-Za-z ]+$/ }]}
            >
              <Input placeholder="John Doe" autoComplete="name" />
            </Form.Item>
            <Form.Item
              name="email"
              label={label("Email")}
              rules={[{ required: true, type: "email", message: "Please input a valid email" }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item name="semester" label={label("Semester")} rules={[{ required: true, message: "Please select your semester" }]}>
              <Select
                placeholder="Select semester"
                options={Array.from({ length: 8 }, (_, i) => ({ value: (i + 1).toString(), label: `Semester ${i + 1}` }))}
              />
            </Form.Item>
            <Form.Item name="role" label={label("Account type")}>
              <Select
                disabled
                options={[
                  { value: "Student", label: "Student" },
                  { value: "Teacher", label: "Teacher" },
                ]}
              />
            </Form.Item>
          </div>
        </Card>

        <Card>
          <CardHeader title="Password" description="Use at least 6 characters." />
          <div className="grid gap-x-4 px-5 pb-1 pt-5 sm:grid-cols-2">
            <Form.Item
              name="password"
              label={label("New password")}
              rules={[{ min: 6, message: "Password must be at least 6 characters" }]}
            >
              <Input.Password placeholder="••••••••" autoComplete="new-password" />
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
              <Input.Password placeholder="••••••••" autoComplete="new-password" />
            </Form.Item>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button onClick={() => form.resetFields()}>Reset</Button>
          <Button variant="primary" icon={Save} loading={saving} onClick={handleSaveChanges}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Settings;
