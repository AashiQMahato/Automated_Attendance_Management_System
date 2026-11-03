import { Modal } from "antd";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

/*
  Glass confirmation dialog for destructive or irreversible actions.
  Built on antd Modal (focus trap, Esc, scroll lock); styled by index.css.
  tone: "danger" (default) | "warning" | "info"
*/
const tones = {
  danger: { tile: "bg-danger/10 text-danger ring-danger/15", button: "danger" },
  warning: { tile: "bg-warning/10 text-warning ring-warning/15", button: "primary" },
  info: { tile: "bg-brand/10 text-brand ring-brand/15", button: "primary" },
};

const ConfirmDialog = ({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  tone = "danger",
  icon: Icon = AlertTriangle,
  children,
}) => {
  const t = tones[tone] || tones.danger;
  return (
    <Modal open={open} onCancel={loading ? undefined : onCancel} footer={null} width={420} centered closable={false} destroyOnClose>
      <div className="flex flex-col items-center px-1 pt-2 text-center">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ${t.tile}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-[17px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
        {description && <p className="mt-1.5 text-[13.5px] leading-5 text-ink-2">{description}</p>}
        {children && <div className="mt-4 w-full text-left">{children}</div>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={t.button} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
