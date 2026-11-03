import { useState } from "react";
import { Modal, message } from "antd";
import { Eye, KeyRound, Trash2, UserPlus, Users } from "lucide-react";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import { dayjs, SEMESTER_OPTIONS } from "../../../lib/format";
import Avatar from "../../ui/Avatar";
import Button from "../../ui/Button";
import { Card, CardHeader } from "../../ui/Card";
import DataTable from "../../ui/DataTable";
import Field, { inputClass } from "../../ui/Field";
import Select from "../../ui/Select";
import PageHeader from "../../ui/PageHeader";
import SidePanel from "../../ui/SidePanel";
import StatusBadge from "../../ui/StatusBadge";
import AsyncContent from "../../ui/AsyncContent";
import { EmptyState } from "../../ui/States";
import { colors as palette } from "../../ui/colors";
import SegmentedControl from "../../ui/SegmentedControl";
import UserActivity from "./UserActivity";

const ROLE_COLOR = { Admin: "rose", Teacher: "indigo", Student: "emerald" };
const EMPTY_FORM = {
  role: "Student",
  fullName: "",
  email: "",
  semester: "",
  password: "",
};

// What else goes away with the account (mirrors DELETE /users/:id).
const DELETE_NOTE = {
  Student:
    "Their enrollments, attendance entries and assignment submissions will be removed.",
  Teacher:
    "Their subjects will be removed, along with all attendance records, assignments and student enrollments for those subjects.",
};

const baseColumns = [
  {
    key: "name",
    header: "Name",
    sortValue: (u) => u.fullName.toLowerCase(),
    render: (u) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={u.fullName} src={u.avatar} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink">{u.fullName}</p>
          <p className="truncate text-xs text-ink-3">{u.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    sortValue: (u) => u.role,
    render: (u) => (
      <StatusBadge color={ROLE_COLOR[u.role]}>{u.role}</StatusBadge>
    ),
  },
  {
    key: "semester",
    header: "Semester",
    align: "right",
    sortValue: (u) => u.semester || 0,
    render: (u) => u.semester ?? "—",
  },
  {
    key: "joined",
    header: "Joined",
    align: "right",
    sortValue: (u) => u.createdAt,
    render: (u) => dayjs(u.createdAt).format("MMM D, YYYY"),
  },
];

// Admin sets a new password for someone who forgot theirs; they're signed out everywhere.
const ResetPassword = ({ user }) => {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch(`/users/${user._id}/password`, {
        password,
      });
      message.success(data.message);
      setPassword("");
    } catch (err) {
      message.error(
        err.response?.data?.message || "Couldn't reset the password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={reset} className="space-y-2">
      <Field
        label="Reset password"
        hint="At least 8 characters. They'll be signed out and must use this password next time."
      >
        {(p) => (
          <div className="flex gap-2">
            <input
              {...p}
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <Button
              type="submit"
              icon={KeyRound}
              loading={saving}
              disabled={password.length < 8}
            >
              Reset
            </Button>
          </div>
        )}
      </Field>
    </form>
  );
};

const AdminAccounts = () => {
  const {
    data: users,
    loading,
    error,
    reload,
    setData,
  } = useAsync(async () => (await api.get("/users")).data.data);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const shown = (users || []).filter(
    (u) =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (semesterFilter === "all" || String(u.semester) === semesterFilter),
  );

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { data } = await api.delete(`/users/${toDelete._id}`);
      setData((list) => list.filter((u) => u._id !== toDelete._id));
      message.success(data.message);
      setToDelete(null);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Couldn't delete the account",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    ...baseColumns,
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      align: "right",
      render: (u) => (
        <div className="inline-flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            icon={Eye}
            onClick={() => setViewing(u)}
          >
            View
          </Button>
          {u.role !== "Admin" && (
            <Button
              size="icon-sm"
              variant="ghost"
              icon={Trash2}
              aria-label={`Delete ${u.fullName}`}
              onClick={() => setToDelete(u)}
              className="hover:!bg-danger/10 hover:!text-danger"
            />
          )}
        </div>
      ),
    },
  ];

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const isAdminForm = form.role === "Admin";
  const createAccount = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post("/users", {
        ...form,
        semester: isAdminForm ? undefined : Number(form.semester),
      });
      setData((list) => [data.data, ...(list || [])]);
      message.success(`${form.role} account created for ${data.data.fullName}`);
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (err) {
      message.error(
        err.response?.data?.message || "Couldn't create the account",
      );
    } finally {
      setSaving(false);
    }
  };

  const count = (role) => (users || []).filter((u) => u.role === role).length;

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Users}
        color="rose"
        title="Accounts"
        description="Everyone who can sign in. Create accounts for any role and see what each person has done."
        actions={
          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setOpen(true)}
          >
            Add user
          </Button>
        }
      />

      <AsyncContent
        loading={loading}
        error={error}
        onRetry={reload}
        skeleton={<Card className="h-80" />}
        errorTitle="Couldn't load accounts"
      >
        {() => (
          <Card>
            <CardHeader
              icon={Users}
              iconTile={palette.rose.tile}
              title="All accounts"
              description={`${count("Teacher")} teachers · ${count("Student")} students · ${count("Admin")} admin`}
            />
            <DataTable
              columns={columns}
              rows={shown}
              toolbar={
                <>
                  <SegmentedControl
                    label="Filter by role"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={[
                      { value: "all", label: "All" },
                      { value: "Student", label: "Students" },
                      { value: "Teacher", label: "Teachers" },
                      { value: "Admin", label: "Admins" },
                    ]}
                  />
                  <Select
                    size="sm"
                    className="w-40"
                    aria-label="Filter by semester"
                    value={semesterFilter}
                    onChange={setSemesterFilter}
                    options={[{ value: "all", label: "All semesters" }, ...SEMESTER_OPTIONS]}
                  />
                </>
              }
              initialSort={{ key: "joined", dir: "desc" }}
              search={{
                placeholder: "Search by name or email",
                getText: (u) => `${u.fullName} ${u.email}`,
              }}
              empty={
                <EmptyState icon={Users} title="No accounts yet" compact />
              }
            />
          </Card>
        )}
      </AsyncContent>

      <Modal
        title="Delete account?"
        open={!!toDelete}
        onCancel={() => setToDelete(null)}
        footer={null}
        width={440}
      >
        <p className="text-sm text-ink-2">
          {toDelete?.fullName} ({toDelete?.email}) will no longer be able to
          sign in. {DELETE_NOTE[toDelete?.role]} This can&apos;t be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button
            variant="danger"
            icon={Trash2}
            loading={deleting}
            onClick={deleteAccount}
          >
            Delete account
          </Button>
        </div>
      </Modal>

      <SidePanel
        open={!!viewing}
        onClose={() => setViewing(null)}
        label={`${viewing?.fullName || ""} activity`}
        accent="from-indigo-500/[0.09] via-sky-500/[0.04] to-transparent"
        footer={viewing && <ResetPassword key={viewing._id} user={viewing} />}
        header={
          viewing && (
            <div className="flex items-center gap-3">
              <Avatar name={viewing.fullName} src={viewing.avatar} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate text-[19px] font-semibold tracking-tight text-ink">
                  {viewing.fullName}
                </h2>
                <p className="truncate text-sm text-ink-2">
                  {viewing.role} · {viewing.email}
                </p>
              </div>
            </div>
          )
        }
      >
        {viewing && <UserActivity key={viewing._id} userId={viewing._id} />}
      </SidePanel>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        label="Add user"
        accent="from-rose-500/[0.09] via-indigo-500/[0.04] to-transparent"
        header={
          <div>
            <h2 className="text-[19px] font-semibold tracking-tight text-ink">
              Add user
            </h2>
            <p className="mt-1 text-sm text-ink-2">
              They sign in with this email and password, then can change both in
              Settings.
            </p>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              form="add-user"
              loading={saving}
            >
              Create account
            </Button>
          </div>
        }
      >
        <form
          id="add-user"
          onSubmit={createAccount}
          className="space-y-4 p-5 sm:p-6"
        >
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-ink-2">Role</p>
            <SegmentedControl
              label="Role"
              size="md"
              value={form.role}
              onChange={(role) => setForm((f) => ({ ...f, role }))}
              options={["Student", "Teacher", "Admin"].map((r) => ({
                value: r,
                label: r,
              }))}
            />
          </div>
          <Field label="Full name">
            {(p) => (
              <input
                {...p}
                required
                autoComplete="off"
                value={form.fullName}
                onChange={set("fullName")}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Email">
            {(p) => (
              <input
                {...p}
                required
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={set("email")}
                className={inputClass}
              />
            )}
          </Field>
          {!isAdminForm && (
            <Field
              label="Semester"
              hint={
                form.role === "Teacher"
                  ? "The semester this teacher mainly teaches."
                  : "The student is enrolled in that semester's subjects."
              }
            >
              {(p) => (
                <Select
                  {...p}
                  required
                  placeholder="Select semester"
                  value={form.semester}
                  onChange={(semester) => setForm((f) => ({ ...f, semester }))}
                  options={SEMESTER_OPTIONS}
                />
              )}
            </Field>
          )}
          <Field
            label="Temporary password"
            hint="At least 8 characters. Share it with them privately."
          >
            {(p) => (
              <input
                {...p}
                required
                minLength={8}
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                className={inputClass}
              />
            )}
          </Field>
        </form>
      </SidePanel>
    </div>
  );
};

export default AdminAccounts;
