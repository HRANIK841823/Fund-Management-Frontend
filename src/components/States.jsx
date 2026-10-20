import { AlertTriangle, Inbox, Loader2 } from "lucide-react";

export function Loading({ label = "Loading…", full = false }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${full ? "min-h-screen" : "py-16"}`}
      role="status"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </div>
  );
}

export function EmptyState({ title, hint, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <Inbox className="mb-3 size-8 text-slate-300" aria-hidden />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-slate-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center" role="alert">
      <AlertTriangle className="mb-3 size-8 text-red-400" aria-hidden />
      <p className="text-sm font-semibold text-slate-700">Could not load this page</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
