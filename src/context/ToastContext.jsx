import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = nextId++;
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => dismiss(id), type === "error" ? 6000 : 4000);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({ success: (m) => push("success", m), error: (m) => push("error", m) }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-3.5 shadow-lg ${
              t.type === "error" ? "border-red-200" : "border-emerald-200"
            }`}
          >
            {t.type === "error" ? (
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" aria-hidden />
            ) : (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
            )}
            <p className="flex-1 text-sm text-slate-800">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
