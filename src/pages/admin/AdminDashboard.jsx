import { useState } from "react";
import { Link } from "react-router-dom";
import { Ban, CheckCircle2, Clock, Users, Wallet } from "lucide-react";
import api from "../../api/client.js";
import { ErrorBox, Loading } from "../../components/States.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import PeriodPicker from "../../components/PeriodPicker.jsx";
import StatCard from "../../components/StatCard.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, currentMonth, currentYear, money } from "../../utils/format.js";

export default function AdminDashboard() {
  const [period, setPeriod] = useState({ month: currentMonth(), year: currentYear() });
  const { data, loading, error, reload } = useFetch(
    () => api.get("/admin/dashboard", { params: period }),
    [period.month, period.year]
  );

  const label = `${MONTHS[period.month - 1]} ${period.year}`;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="The fund total counts approved payments only."
        actions={<PeriodPicker {...period} onChange={setPeriod} />}
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <>
          <div className="card mb-4 flex flex-wrap items-end justify-between gap-4 border-brand-100 bg-brand-50 p-5 sm:p-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium text-brand-800">
                <Wallet className="size-4" aria-hidden /> Total approved fund
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight text-brand-900">{money(data.total_approved_fund)}</p>
            </div>
            <p className="text-sm text-brand-800">
              {data.approved_count} approved {data.approved_count === 1 ? "payment" : "payments"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Pending submissions" value={data.pending_count} tone="amber" icon={Clock}
              hint={data.pending_count > 0 ? undefined : "Nothing waiting for review"}
              to={data.pending_count > 0 && (
                <Link to="/admin/approvals" className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:underline">Review now</Link>
              )} />
            <StatCard label="Approved payments" value={data.approved_count} tone="green" icon={CheckCircle2} />
            <StatCard label="Rejected submissions" value={data.rejected_count} tone="red" icon={Ban} />
            <StatCard label="Registered members" value={data.total_members} icon={Users} />
          </div>

          <h2 className="mb-3 mt-8 text-base font-bold text-slate-900">{label}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Paid members" value={data.paid_members} tone="green" hint={`of ${data.total_members}`} />
            <StatCard label="Pending members" value={data.pending_members} tone="amber" />
            <StatCard label="Unpaid members" value={data.unpaid_members} hint="No pending or approved payment" />
            <StatCard label="Monthly contribution" value={money(data.monthly_contribution_amount)} hint="Applies to new submissions" />
          </div>

          <div className="card mt-4 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-slate-600">Collected in {label}</p>
              <p className="text-sm text-slate-600">
                <span className="text-lg font-bold text-emerald-700">{money(data.approved_total_for_month)}</span>
                {" "}of {money(data.expected_total)} expected
              </p>
            </div>
            <div
              className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={data.expected_total}
              aria-valuenow={data.approved_total_for_month}
              aria-label="Collected versus expected"
            >
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${data.expected_total ? Math.min(100, (data.approved_total_for_month / data.expected_total) * 100) : 0}%` }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
