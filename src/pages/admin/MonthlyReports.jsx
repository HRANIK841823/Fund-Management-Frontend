import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import PeriodPicker from "../../components/PeriodPicker.jsx";
import { EmptyState, ErrorBox, Loading } from "../../components/States.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, currentMonth, currentYear, money } from "../../utils/format.js";

export default function MonthlyReports() {
  const [period, setPeriod] = useState({ month: currentMonth(), year: currentYear() });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data, loading, error, reload } = useFetch(
    () => api.get("/admin/monthly-report", { params: period }),
    [period.month, period.year]
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.rows ?? []).filter(
      (r) =>
        (!statusFilter || r.status === statusFilter) &&
        (!q || r.member_name.toLowerCase().includes(q) || r.username.toLowerCase().includes(q))
    );
  }, [data, query, statusFilter]);

  return (
    <>
      <PageHeader
        title="Monthly reports"
        description="Who has paid, who is waiting for approval, and who has not paid for a chosen month."
        actions={<PeriodPicker {...period} onChange={setPeriod} />}
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Paid" value={data.summary.paid} tone="green" />
            <StatCard label="Pending" value={data.summary.pending} tone="amber" />
            <StatCard label="Unpaid" value={data.summary.unpaid} />
            <StatCard label="Approved / expected" value={money(data.summary.approved_total)} hint={`of ${money(data.summary.expected_total)}`} tone="green" />
          </div>

          <div className="card overflow-hidden">
            <div className="flex flex-wrap gap-3 border-b border-slate-200 p-3">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
                <label htmlFor="r-search" className="sr-only">Search member</label>
                <input id="r-search" className="input pl-9" placeholder="Search member" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <div>
                <label htmlFor="r-status" className="sr-only">Status</label>
                <select id="r-status" className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            {rows.length === 0 ? (
              <EmptyState
                title={data.rows.length === 0 ? "No members yet" : "No matching members"}
                hint={data.rows.length === 0 ? "Create member accounts to see them here." : "Try a different search or status."}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="th">Member</th>
                      <th className="th">Month</th>
                      <th className="th">Year</th>
                      <th className="th text-right">Expected</th>
                      <th className="th text-right">Approved</th>
                      <th className="th">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.user_id}>
                        <td className="td">
                          <p className="font-semibold text-slate-900">{r.member_name}</p>
                          <p className="text-xs text-slate-500">@{r.username}</p>
                        </td>
                        <td className="td">{MONTHS[r.month - 1]}</td>
                        <td className="td">{r.year}</td>
                        <td className="td text-right">{money(r.expected_amount)}</td>
                        <td className="td text-right font-medium">{money(r.approved_amount)}</td>
                        <td className="td">
                          <StatusBadge status={r.status} />
                          {r.rejected_count > 0 && r.status === "unpaid" && (
                            <p className="mt-1 text-xs text-red-600">
                              Rejected {r.rejected_count}×{r.last_rejection_reason ? `: ${r.last_rejection_reason}` : ""}
                            </p>
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
      )}
    </>
  );
}
