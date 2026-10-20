import { Link } from "react-router-dom";
import { CalendarCheck, CircleDollarSign, Landmark, Wallet } from "lucide-react";
import api from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import { EmptyState, ErrorBox, Loading } from "../../components/States.jsx";
import StatCard from "../../components/StatCard.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, fmtDateTime, methodLabel, money } from "../../utils/format.js";

export default function MemberDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch(() => api.get("/member/dashboard"));

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Your contributions and the group fund at a glance."
        actions={<Link to="/member/submit" className="btn btn-primary">Submit payment</Link>}
      />

      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Monthly contribution" value={money(data.monthly_contribution_amount)} icon={CircleDollarSign} />
            <StatCard label="You have contributed" value={money(data.total_contributed)} tone="green" icon={Wallet} hint="Approved payments only" />
            <StatCard label="Group fund" value={money(data.fund_balance)} icon={Landmark} hint="All approved payments" />
            <StatCard
              label={`Months paid in ${data.year}`}
              value={data.months_paid}
              tone="green"
              icon={CalendarCheck}
              hint={`${data.months_unpaid} unpaid${data.months_pending ? `, ${data.months_pending} awaiting approval` : ""}`}
            />
          </div>

          {data.months_unpaid > 0 && (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              You have {data.months_unpaid} unpaid {data.months_unpaid === 1 ? "month" : "months"} so far this year.{" "}
              <Link to="/member/status" className="font-semibold underline">See which ones</Link>
            </p>
          )}

          <div className="card mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-bold text-slate-900">Recent payments</h2>
              <Link to="/member/history" className="text-sm font-semibold text-brand-700 hover:underline">View all</Link>
            </div>
            {data.recent_payments.length === 0 ? (
              <EmptyState title="No payments yet" hint="Submit your first monthly payment to see it here." action={<Link to="/member/submit" className="btn btn-primary">Submit payment</Link>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr>{["Month", "Amount", "Method", "Submitted", "Status"].map((h) => <th key={h} className="th">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {data.recent_payments.map((p) => (
                      <tr key={p.id}>
                        <td className="td font-medium text-slate-900">{MONTHS[p.month - 1]} {p.year}</td>
                        <td className="td">{money(p.amount)}</td>
                        <td className="td">{methodLabel(p.payment_method)}</td>
                        <td className="td whitespace-nowrap">{fmtDateTime(p.submitted_at)}</td>
                        <td className="td"><StatusBadge status={p.status} /></td>
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
