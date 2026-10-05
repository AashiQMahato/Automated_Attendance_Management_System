import React, { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { message } from "antd";
import api from "../../../lib/api";
import Button from "../../ui/Button";
import { Card } from "../../ui/Card";
import Field, { inputClass } from "../../ui/Field";

// First-run state for teachers with no subjects yet.
const SubjectSetup = ({ onSubjectCreated }) => {
  const [subjectData, setSubjectData] = useState({ name: "", code: "", semester: "", creditHours: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSubjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/subjects", subjectData, { headers: { "Content-Type": "application/json" } });
      message.success("Subject created");
      onSubjectCreated(response.data);
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to create subject");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg py-4 sm:py-10">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">Add your first subject</h1>
        <p className="mt-1 text-sm text-ink-2">Subjects organize attendance, reports and assignments.</p>
      </div>
      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Subject name">
            {(p) => (
              <input
                {...p}
                name="name"
                value={subjectData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g. Computer Networks"
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Subject code" hint="Must be unique, e.g. CN301">
            {(p) => (
              <input
                {...p}
                name="code"
                value={subjectData.code}
                onChange={handleInputChange}
                required
                placeholder="e.g. CN301"
                className={inputClass}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Semester">
              {(p) => (
                <select {...p} name="semester" value={subjectData.semester} onChange={handleInputChange} required className={inputClass}>
                  <option value="" disabled>
                    Select
                  </option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Semester {i + 1}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Credit hours">
              {(p) => (
                <input
                  {...p}
                  type="number"
                  name="creditHours"
                  value={subjectData.creditHours}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="6"
                  placeholder="3"
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <Button type="submit" variant="primary" size="lg" icon={Plus} loading={submitting} className="mt-2 w-full">
            Create subject
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default SubjectSetup;
