import { MONTHS, yearOptions } from "../utils/format.js";

/** Month + year dropdowns used on the dashboard, reports and member pages. */
export default function PeriodPicker({ month, year, onChange, showMonth = true }) {
  return (
    <div className="flex items-center gap-2">
      {showMonth && (
        <div>
          <label htmlFor="period-month" className="sr-only">Month</label>
          <select id="period-month" className="input w-auto" value={month} onChange={(e) => onChange({ month: Number(e.target.value), year })}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="period-year" className="sr-only">Year</label>
        <select id="period-year" className="input w-auto" value={year} onChange={(e) => onChange({ month, year: Number(e.target.value) })}>
          {yearOptions().map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
