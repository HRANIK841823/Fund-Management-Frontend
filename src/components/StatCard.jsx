const TONES = {
  default: "text-slate-900",
  green: "text-emerald-700",
  amber: "text-amber-700",
  red: "text-red-700",
};

export default function StatCard({ label, value, hint, tone = "default", icon: Icon, to, className = "" }) {
  return (
    <div className={`card p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && <Icon className="size-4 shrink-0 text-slate-400" aria-hidden />}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight sm:text-[1.7rem] ${TONES[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {to}
    </div>
  );
}
