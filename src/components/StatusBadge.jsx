const STYLES = {
  approved: { label: "Approved", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", dot: "bg-emerald-500" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-800 ring-amber-600/25", dot: "bg-amber-500" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-700 ring-red-600/20", dot: "bg-red-500" },
  unpaid: { label: "Unpaid", cls: "bg-slate-100 text-slate-600 ring-slate-500/20", dot: "bg-slate-400" },
};

export default function StatusBadge({ status }) {
  const s = STYLES[status] ?? STYLES.unpaid;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
