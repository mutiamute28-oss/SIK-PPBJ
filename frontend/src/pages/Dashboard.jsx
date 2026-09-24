import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { rupiah } from "@/lib/api";
import { StatusBadge, DocTypeBadge } from "@/components/Badges";
import { FileText, Wallet, Receipt, ClipboardCheck, BookOpen, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const CARD = "bg-white border border-slate-200 rounded-lg shadow-sm p-5";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const nav = useNavigate();

  useEffect(() => { api.get("/dashboard/summary").then((r) => setData(r.data)); }, []);

  if (!data) return <div className="text-slate-500">Memuat ringkasan…</div>;

  const typeCards = [
    { t: "PPBJ", label: "Permintaan Pengadaan", icon: FileText, to: "/ppbj", color: "text-teal-600 bg-teal-50" },
    { t: "PUM", label: "Permohonan Uang Muka", icon: Wallet, to: "/pum", color: "text-amber-600 bg-amber-50" },
    { t: "PP", label: "Permohonan Pembayaran", icon: Receipt, to: "/pp", color: "text-indigo-600 bg-indigo-50" },
    { t: "PTUM", label: "Pertanggungjawaban UM", icon: ClipboardCheck, to: "/ptum", color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan pengajuan & status penjurnalan PT. Sumber Berdaya Bersama.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {typeCards.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.t} onClick={() => nav(c.to)} data-testid={`summary-${c.t}`}
              className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 text-left hover:shadow-md hover:border-[#14758a]/40 transition-all">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular">{data.by_type[c.t] || 0}</div>
              <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
              <div className="mt-1"><DocTypeBadge type={c.t} /></div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={CARD}>
          <div className="flex items-center gap-2 text-orange-600 mb-2"><Clock className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Menunggu</span></div>
          <div className="text-2xl font-bold text-slate-900 tabular">{data.pending}</div>
        </div>
        <div className={CARD}>
          <div className="flex items-center gap-2 text-green-600 mb-2"><CheckCircle2 className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Disetujui</span></div>
          <div className="text-2xl font-bold text-slate-900 tabular">{data.approved}</div>
        </div>
        <div className={CARD}>
          <div className="flex items-center gap-2 text-blue-600 mb-2"><BookOpen className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Jurnal Dibuat</span></div>
          <div className="text-2xl font-bold text-slate-900 tabular">{data.journals}</div>
        </div>
        <div className={`${CARD} bg-[#0d3c45] border-0`}>
          <div className="flex items-center gap-2 text-teal-200 mb-2"><TrendingUp className="w-4 h-4" /><span className="text-xs font-semibold uppercase tracking-wide">Total Nilai Pengajuan</span></div>
          <div className="text-xl font-bold text-white tabular">{rupiah(data.total_nilai)}</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="font-heading font-semibold text-slate-900">Pengajuan Terbaru</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">No. Dokumen</th>
                <th className="text-left px-5 py-3 font-semibold">Jenis</th>
                <th className="text-left px-5 py-3 font-semibold">Kegiatan</th>
                <th className="text-right px-5 py-3 font-semibold">Nilai</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Belum ada pengajuan.</td></tr>
              )}
              {data.recent.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-teal-50/40">
                  <td className="px-5 py-3 font-mono text-xs text-slate-700">{d.no}</td>
                  <td className="px-5 py-3"><DocTypeBadge type={d.doc_type} /></td>
                  <td className="px-5 py-3 text-slate-700 max-w-[280px] truncate">{d.kegiatan || d.keterangan || "-"}</td>
                  <td className="px-5 py-3 text-right tabular text-slate-800">{rupiah(d.total)}</td>
                  <td className="px-5 py-3"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
