import React from "react";
import { Select } from "antd";
import { titleCase } from "../../lib/format";

// Subject picker shared by Take attendance and Reports. A value that isn't in
// the list yet (e.g. from ?subject= while subjects load) stays hidden rather
// than flashing a raw id.
const SubjectSelect = ({ subjects, value, onChange, loading = false, id, className = "", placeholder = "Choose a subject" }) => {
  const known = subjects.some((s) => s._id === value);
  return (
    <Select
      id={id}
      aria-label={id ? undefined : "Subject"}
      value={known ? value : undefined}
      onChange={onChange}
      loading={loading}
      disabled={loading && !subjects.length}
      placeholder={loading ? "Loading subjects…" : placeholder}
      className={`w-full ${className}`}
      showSearch
      optionFilterProp="label"
      options={subjects.map((s) => ({
        value: s._id,
        label: s.code ? `${titleCase(s.name)} · ${s.code}` : titleCase(s.name),
      }))}
      notFoundContent={<span className="text-[13px] text-ink-3">No subjects</span>}
    />
  );
};

export default SubjectSelect;
