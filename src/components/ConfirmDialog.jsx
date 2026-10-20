import { useEffect, useRef } from "react";

/**
 * Modal built on the native <dialog> element (focus trap, Esc to close, backdrop).
 * `children` is rendered between the message and the buttons (e.g. a reason field).
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  tone = "primary", // primary | danger | success
  busy = false,
  onConfirm,
  onCancel,
  children,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const btn = { primary: "btn-primary", danger: "btn-danger", success: "btn-success" }[tone];

  return (
    <dialog
      ref={ref}
      onClose={onCancel}
      onClick={(e) => e.target === ref.current && !busy && onCancel()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 shadow-xl"
      aria-labelledby="confirm-title"
    >
      {open && (
        <form
          method="dialog"
          className="p-5 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            onConfirm();
          }}
        >
          <h2 id="confirm-title" className="text-base font-bold text-slate-900">{title}</h2>
          {message && <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>}
          {children && <div className="mt-4">{children}</div>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className={`btn ${btn}`} disabled={busy}>
              {busy ? "Please wait…" : confirmLabel}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
