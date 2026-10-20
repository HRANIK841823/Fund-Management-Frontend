import { useState } from "react";
import api, { errorMessage } from "../api/client.js";
import PageHeader from "../components/PageHeader.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ChangePassword() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("The new passwords do not match.");
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: current, new_password: next });
      toast.success("Password updated.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Change password" description="Choose a password you do not use anywhere else." />
      <form onSubmit={submit} className="card max-w-md space-y-4 p-5 sm:p-6" noValidate>
        {error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        <div>
          <label htmlFor="current" className="label">Current password</label>
          <PasswordInput id="current" value={current} onChange={setCurrent} autoComplete="current-password" />
        </div>
        <div>
          <label htmlFor="next" className="label">New password</label>
          <PasswordInput id="next" value={next} onChange={setNext} autoComplete="new-password" />
          <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="confirm" className="label">Confirm new password</label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        </div>
        <button className="btn btn-primary" disabled={busy || !current || !next || !confirm}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </>
  );
}
