import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { EmptyState, ErrorBox, Loading } from "../../components/States.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, fmtDateTime, methodLabel, money } from "../../utils/format.js";

export default function PaymentHistory() {
  const { data, loading, error, reload } = useFetch(() => api.get("/member/payments"));
  const [status, setStatus] = useState("");
  const rows = useMemo(() => (data ?? []).filter((p) => !status || p.status === status), [data, status]);

  return (
    <>
      <PageHeader
        title="My payment history"
        description="Everything you have submitted, including rejected payments."
        actions={<Link to="/member/submit" className="btn btn-primary">Submit payment</Link>}
      />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-3">
          <label htmlFor="h-status" className="sr-only">Status</label>
          <select id="h-status" className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {loading && !data ? (
          <Loading />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : rows.length === 0 ? (
          <EmptyState
            title={data.length === 0 ? "No payments yet" : "No payments with this status"}
            hint={data.length === 0 ? "Payments you submit will be listed here." : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>{["Month", "Amount", "Method", "Submitted", "Reviewed", "Status"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td className="td font-medium text-slate-900">{MONTHS[p.month - 1]} {p.year}</td>
                    <td className="td">{money(p.amount)}</td>
                    <td className="td">{methodLabel(p.payment_method)}</td>
                    <td className="td whitespace-nowrap">{fmtDateTime(p.submitted_at)}</td>
                    <td className="td whitespace-nowrap">{fmtDateTime(p.reviewed_at)}</td>
                    <td className="td">
                      <StatusBadge status={p.status} />
                      {p.status === "rejected" && p.rejection_reason && (
                        <p className="mt-1 max-w-[200px] text-xs text-slate-500">{p.rejection_reason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
