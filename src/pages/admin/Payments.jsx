import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Check, X } from "lucide-react";
import api, { errorMessage } from "../../api/client.js";
import ConfirmDialog from "../../components/ConfirmDialog.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import { EmptyState, ErrorBox, Loading } from "../../components/States.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, fmtDateTime, methodLabel, money, yearOptions } from "../../utils/format.js";

/** mode="approvals": pending queue. mode="all": full history including rejected. */
export default function Payments({ mode }) {
  const isApprovals = mode === "approvals";
  const toast = useToast();
  const { refreshPending } = useOutletContext();

  const [filters, setFilters] = useState({ q: "", user_id: "", month: "", year: "", status: isApprovals ? "pending" : "" });
  const [action, setAction] = useState(null); // { type: "approve" | "reject", payment }
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  // Reset filters when switching between the two pages.
  useEffect(() => {
    setFilters({ q: "", user_id: "", month: "", year: "", status: isApprovals ? "pending" : "" });
  }, [isApprovals]);

  const members = useFetch(() => api.get("/admin/members"));
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ""));
  const { data, loading, error, reload } = useFetch(
    () => api.get("/admin/payments", { params }),
    [filters.q, filters.user_id, filters.month, filters.year, filters.status]
  );

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  const hasFilters = Object.entries(filters).some(([k, v]) => v !== "" && !(isApprovals && k === "status"));

  const close = () => { setAction(null); setReason(""); };

  const confirm = async () => {
    setBusy(true);
    const { type, payment } = action;
    try {
      await api.post(
        `/admin/payments/${payment.id}/${type}`,
        type === "reject" ? { reason: reason || null } : undefined
      );
      toast.success(type === "approve" ? "Payment approved and added to the fund." : "Payment rejected. The member can submit again.");
      close();
      reload();
      refreshPending();
    } catch (err) {
      toast.error(errorMessage(err));
      close();
      reload(); // the payment may have been reviewed elsewhere: show the latest state
      refreshPending();
    } finally {
      setBusy(false);
    }
  };

  const target = action?.payment;
  const targetLabel = target ? `${target.member_name}, ${MONTHS[target.month - 1]} ${target.year} (${money(target.amount)})` : "";

  return (
    <>
      <PageHeader
        title={isApprovals ? "Payment approvals" : "All payments"}
        description={
          isApprovals
            ? "Review what members have submitted. Approved payments are added to the fund."
            : "The complete record, including rejected submissions. Nothing here is ever deleted."
        }
      />

      <div className="card overflow-hidden">
        <div className="grid gap-3 border-b border-slate-200 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor="f-q" className="sr-only">Search member</label>
            <input id="f-q" className="input" placeholder="Search name or username" value={filters.q} onChange={setFilter("q")} />
          </div>
          <div>
            <label htmlFor="f-member" className="sr-only">Member</label>
            <select id="f-member" className="input" value={filters.user_id} onChange={setFilter("user_id")}>
              <option value="">All members</option>
              {(members.data ?? []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-month" className="sr-only">Month</label>
            <select id="f-month" className="input" value={filters.month} onChange={setFilter("month")}>
              <option value="">All months</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-year" className="sr-only">Year</label>
            <select id="f-year" className="input" value={filters.year} onChange={setFilter("year")}>
              <option value="">All years</option>
              {yearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {!isApprovals && (
            <div>
              <label htmlFor="f-status" className="sr-only">Status</label>
              <select id="f-status" className="input" value={filters.status} onChange={setFilter("status")}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {loading && !data ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : data.length === 0 ? (
          <EmptyState
            title={isApprovals && !hasFilters ? "No submissions waiting" : "No payments match"}
            hint={isApprovals && !hasFilters ? "New member submissions will show up here." : "Try changing or clearing the filters."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr>
                  {["Member", "Username", "Month", "Year", "Amount", "Method", "Submitted", "Status", "Action"].map((h) => (
                    <th key={h} className="th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((p) => (
                  <tr key={p.id}>
                    <td className="td font-semibold text-slate-900">
                      {p.member_name}
                      {p.member_removed && <span className="ml-2 text-xs font-normal text-slate-400">(removed)</span>}
                    </td>
                    <td className="td">@{p.member_username}</td>
                    <td className="td">{MONTHS[p.month - 1]}</td>
                    <td className="td">{p.year}</td>
                    <td className="td font-medium">{money(p.amount)}</td>
                    <td className="td">{methodLabel(p.payment_method)}</td>
                    <td className="td whitespace-nowrap">{fmtDateTime(p.submitted_at)}</td>
                    <td className="td">
                      <StatusBadge status={p.status} />
                      {p.status === "rejected" && p.rejection_reason && (
                        <p className="mt-1 max-w-[180px] text-xs text-slate-500">{p.rejection_reason}</p>
                      )}
                    </td>
                    <td className="td">
                      {p.status === "pending" ? (
                        <div className="flex gap-2">
                          <button className="btn btn-success px-2.5 py-1.5" onClick={() => setAction({ type: "approve", payment: p })}>
                            <Check className="size-4" aria-hidden /> Approve
                          </button>
                          <button className="btn btn-secondary px-2.5 py-1.5 text-red-700 hover:bg-red-50" onClick={() => setAction({ type: "reject", payment: p })}>
                            <X className="size-4" aria-hidden /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={action?.type === "approve"}
        title="Approve this payment?"
        message={`${targetLabel} will be counted in the fund and that month will be marked paid.`}
        confirmLabel="Approve payment"
        tone="success"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => !busy && close()}
      />
      <ConfirmDialog
        open={action?.type === "reject"}
        title="Reject this payment?"
        message={`${targetLabel} will not be counted. The record is kept and the member can submit again for that month.`}
        confirmLabel="Reject payment"
        tone="danger"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => !busy && close()}
      >
        <label htmlFor="reason" className="label">Reason (optional)</label>
        <input id="reason" className="input" maxLength={255} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Not received" />
      </ConfirmDialog>
    </>
  );
}
