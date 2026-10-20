import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import api, { errorMessage } from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { ErrorBox, Loading } from "../../components/States.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import { METHODS, MONTHS, currentMonth, currentYear, money, yearOptions } from "../../utils/format.js";

const SUFFIX = { paid: "already paid", pending: "awaiting approval" };

export default function SubmitPayment() {
  const toast = useToast();
  const [params] = useSearchParams();
  const [year, setYear] = useState(Number(params.get("year")) || currentYear());
  const [month, setMonth] = useState(Number(params.get("month")) || currentMonth());
  const [method, setMethod] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  const { data, loading, error, reload } = useFetch(() => api.get("/member/monthly-status", { params: { year } }), [year]);

  // Keep the selected month valid: if it became unavailable, jump to the first open one.
  useEffect(() => {
    if (!data) return;
    const row = data.rows[month - 1];
    if (!row.can_submit) {
      const open = data.rows.find((r) => r.can_submit);
      setMonth(open ? open.month : month);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const selected = data?.rows[month - 1];
  const allTaken = data && data.rows.every((r) => !r.can_submit);

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!method) return setFormError("Choose a payment method.");
    setBusy(true);
    try {
      // Note: no amount is sent. The server always uses the current monthly contribution.
      await api.post("/member/payments", { month, year, payment_method: method });
      setSubmitted({ month, year });
      toast.success("Payment submitted. Waiting for admin approval.");
      setMethod("");
      reload();
    } catch (err) {
      setFormError(errorMessage(err));
      reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Submit payment" description="Record a payment you have made. The admin will review and approve it." />

      {submitted && (
        <div className="mb-4 flex max-w-xl items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900" role="status">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden />
          <p>
            Your {MONTHS[submitted.month - 1]} {submitted.year} payment is <strong>awaiting admin approval</strong>.{" "}
            <Link to="/member/history" className="font-semibold underline">View history</Link>
          </p>
        </div>
      )}

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <form onSubmit={submit} className="card max-w-xl space-y-5 p-5 sm:p-6" noValidate>
          {formError && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="month" className="label">Month</label>
              <select id="month" className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {data.rows.map((r) => (
                  <option key={r.month} value={r.month} disabled={!r.can_submit}>
                    {MONTHS[r.month - 1]}
                    {SUFFIX[r.status] ? ` (${SUFFIX[r.status]})` : r.rejected_count ? " (rejected, submit again)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="label">Year</label>
              <select id="year" className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {selected?.last_rejection_reason && selected.can_submit && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Your earlier submission for this month was rejected: {selected.last_rejection_reason}
            </p>
          )}

          <fieldset>
            <legend className="label">Payment method</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600 ${
                    method === m.value ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input type="radio" name="method" className="accent-brand-700" value={m.value} checked={method === m.value} onChange={() => setMethod(m.value)} />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="amount" className="label">Amount</label>
            <input id="amount" className="input" value={money(data.monthly_contribution_amount)} readOnly disabled />
            <p className="mt-1 text-xs text-slate-500">Set by the admin. It cannot be changed here.</p>
          </div>

          {allTaken && (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">Every month of {year} already has a payment. Pick another year to continue.</p>
          )}

          <button className="btn btn-primary w-full sm:w-auto" disabled={busy || allTaken || !selected?.can_submit}>
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
        </form>
      )}
    </>
  );
}
