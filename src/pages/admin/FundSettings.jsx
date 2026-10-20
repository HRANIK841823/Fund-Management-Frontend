import { useEffect, useState } from "react";
import api, { errorMessage } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { ErrorBox, Loading } from "../../components/States.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import { fmtDateTime, money } from "../../utils/format.js";

export default function FundSettings() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => api.get("/admin/fund-settings"));
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setAmount(String(data.monthly_contribution_amount));
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    setFormError("");
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) return setFormError("Enter a whole amount greater than zero.");
    setSaving(true);
    try {
      await api.put("/admin/fund-settings", { monthly_contribution_amount: value });
      toast.success(`Monthly contribution is now ${money(value)}.`);
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Fund settings" description="Set how much each member contributes every month." />
      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <form onSubmit={save} className="card max-w-md p-5 sm:p-6" noValidate>
          <p className="text-sm text-slate-500">Current monthly contribution</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{money(data.monthly_contribution_amount)}</p>
          <p className="mt-1 text-xs text-slate-500">Last updated {fmtDateTime(data.updated_at)}</p>

          <div className="mt-6">
            <label htmlFor="amount" className="label">New amount (৳)</label>
            <input id="amount" inputMode="numeric" className="input" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} required />
            {formError && <p role="alert" className="mt-2 text-sm text-red-600">{formError}</p>}
            <p className="mt-2 text-xs text-slate-500">
              Applies to payments submitted from now on. Payments already submitted or approved keep their original amount.
            </p>
          </div>
          <button className="btn btn-primary mt-5" disabled={saving || String(data.monthly_contribution_amount) === amount}>
            {saving ? "Saving…" : "Save amount"}
          </button>
        </form>
      )}
    </>
  );
}
