import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";
import PageHeader from "../../components/PageHeader.jsx";
import PeriodPicker from "../../components/PeriodPicker.jsx";
import { ErrorBox, Loading } from "../../components/States.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import useFetch from "../../hooks/useFetch.js";
import { MONTHS, currentYear, methodLabel, money } from "../../utils/format.js";

export default function MonthlyStatus() {
  const [year, setYear] = useState(currentYear());
  const { data, loading, error, reload } = useFetch(() => api.get("/member/monthly-status", { params: { year } }), [year]);

  return (
    <>
      <PageHeader
        title="My monthly status"
        description="Which months are paid, waiting for approval, or still unpaid."
        actions={<PeriodPicker showMonth month={1} year={year} onChange={({ year: y }) => setYear(y)} />}
      />
      {loading && !data ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.rows.map((r) => (
            <li key={r.month} className="card flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">{MONTHS[r.month - 1]}</h2>
                <StatusBadge status={r.status} />
              </div>
              {r.status === "unpaid" ? (
                <>
                  <p className="text-sm text-slate-500">
                    {r.is_due ? `${money(data.monthly_contribution_amount)} due` : "Not due yet"}
                  </p>
                  {r.last_rejection_reason && <p className="text-xs text-red-600">Last submission rejected: {r.last_rejection_reason}</p>}
                  {r.rejected_count > 0 && !r.last_rejection_reason && <p className="text-xs text-red-600">Last submission was rejected.</p>}
                  <Link to={`/member/submit?month=${r.month}&year=${r.year}`} className="mt-1 text-sm font-semibold text-brand-700 hover:underline">
                    {r.rejected_count > 0 ? "Submit again" : "Submit payment"}
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-600">
                  {money(r.amount)} via {methodLabel(r.payment_method)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
