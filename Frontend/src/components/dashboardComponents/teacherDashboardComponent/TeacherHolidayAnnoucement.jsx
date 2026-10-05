import { useState } from "react";
import { colors as palette } from "../../ui/colors";
import { DatePicker, Form, Input, Popconfirm, message } from "antd";
import dayjs from "dayjs";
import { CalendarRange, Megaphone, Pencil, Trash2 } from "lucide-react";
import api from "../../../lib/api";
import useAsync from "../../../lib/useAsync";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import AsyncContent from "../../ui/AsyncContent";
import { Card, CardHeader } from "../../ui/Card";
import { EmptyState } from "../../ui/States";
import HolidayCard, { HolidaySkeleton, holidayStatus } from "../../dashboard/HolidayCard";

const TeacherHolidayAnnouncement = () => {
  const [form] = Form.useForm();
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const holidaysState = useAsync(() => api.get("/holidays").then(({ data }) => data.data || []), []);
  const holidays = holidaysState.data || [];

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        startDate: values.dates[0].toISOString(),
        endDate: values.dates[1].toISOString(),
      };
      if (editId) {
        await api.put(`/holidays/${editId}`, payload);
        message.success("Holiday updated");
      } else {
        await api.post("/holidays", payload);
        message.success("Holiday announced");
      }
      setEditId(null);
      form.resetFields();
      holidaysState.reload({ silent: true });
    } catch (error) {
      message.error(error.response?.data?.error || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/holidays/${id}`);
      message.success("Holiday deleted");
      if (editId === id) cancelEdit();
      holidaysState.reload({ silent: true });
    } catch (error) {
      message.error(error.response?.data?.error || "Delete failed");
    }
  };

  const startEdit = (holiday) => {
    setEditId(holiday._id);
    form.setFieldsValue({
      title: holiday.title,
      description: holiday.description,
      dates: [dayjs(holiday.startDate), dayjs(holiday.endDate)],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    form.resetFields();
  };

  const sorted = [...holidays].sort((a, b) => {
    const pa = holidayStatus(a) === "passed";
    const pb = holidayStatus(b) === "passed";
    if (pa !== pb) return pa ? 1 : -1;
    return new Date(a.startDate) - new Date(b.startDate);
  });

  const label = (text) => <span className="text-[13px] font-medium text-ink-2">{text}</span>;

  return (
    <div className="space-y-4">
      <PageHeader icon={CalendarRange} color="rose" title="Holidays" description="Announce breaks and observances to every student." />

      <div className="grid items-start gap-4 lg:grid-cols-[360px,minmax(0,1fr)]">
        <Card className="lg:sticky lg:top-20">
          <CardHeader
            icon={editId ? Pencil : Megaphone}
            iconTile={palette.rose.tile}
            title={editId ? "Edit holiday" : "New announcement"}
            description={editId ? "Update the details below." : "Students see this instantly."}
          />
          <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false} className="px-5 pb-5 pt-4">
            <Form.Item name="title" label={label("Title")} rules={[{ required: true, message: "Please add a title" }]}>
              <Input placeholder="e.g. Dashain break" />
            </Form.Item>
            <Form.Item name="dates" label={label("Dates")} rules={[{ required: true, message: "Please pick the dates" }]}>
              <DatePicker.RangePicker
                className="w-full"
                format="MMM D, YYYY"
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>
            <Form.Item name="description" label={label("Details")} rules={[{ required: true, message: "Please add details" }]}>
              <Input.TextArea rows={4} placeholder="Anything students should know" />
            </Form.Item>
            <div className="flex gap-2">
              {editId && (
                <Button onClick={cancelEdit} className="flex-1">
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="primary" loading={saving} className="flex-1">
                {editId ? "Save changes" : "Publish"}
              </Button>
            </div>
          </Form>
        </Card>

        <AsyncContent
          loading={holidaysState.loading}
          error={holidaysState.error}
          onRetry={holidaysState.reload}
          loadingLabel="Loading holidays"
          errorTitle="We couldn't load holidays"
          skeleton={<HolidaySkeleton />}
        >
          {sorted.length === 0 ? (
            <Card>
              <EmptyState icon={CalendarRange} title="No holidays announced" description="Your announcements will appear here." />
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {sorted.map((holiday) => (
                <HolidayCard
                  key={holiday._id}
                  holiday={holiday}
                  actions={
                    <div className="flex shrink-0 gap-0.5">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        icon={Pencil}
                        aria-label={`Edit ${holiday.title}`}
                        onClick={() => startEdit(holiday)}
                      />
                      <Popconfirm
                        title="Delete this holiday?"
                        description="Students will no longer see it."
                        okText="Delete"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleDelete(holiday._id)}
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          icon={Trash2}
                          aria-label={`Delete ${holiday.title}`}
                          className="hover:!bg-danger/10 hover:!text-danger"
                        />
                      </Popconfirm>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </AsyncContent>
      </div>
    </div>
  );
};

export default TeacherHolidayAnnouncement;
