import { rupiah } from "@/lib/api";

const STATUS = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600 border-slate-300" },
  pending_approval: { label: "Menunggu Persetujuan", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  approved: { label: "Disetujui", cls: "bg-green-50 text-green-700 border-green-200" },
  rejected: { label: "Ditolak", cls: "bg-red-50 text-red-700 border-red-200" },
  posted: { label: "Sudah Dijurnal", cls: "bg-blue-50 text-blue-700 border-blue-200" },
};

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span data-testid={`status-${status}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

export function DocTypeBadge({ type }) {
  const map = {
    PPBJ: "bg-teal-50 text-teal-700 border-teal-200",
    PUM: "bg-amber-50 text-amber-700 border-amber-200",
    PP: "bg-indigo-50 text-indigo-700 border-indigo-200",
    PTUM: "bg-purple-50 text-purple-700 border-purple-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${map[type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      {type}
    </span>
  );
}

export { rupiah };
