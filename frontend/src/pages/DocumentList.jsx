import { useEffect, useState, useCallback } from "react";
import api, { rupiah } from "@/lib/api";
import Modal from "@/components/Modal";
import DocumentForm from "@/pages/DocumentForm";
import DocumentDetail from "@/pages/DocumentDetail";
import { StatusBadge } from "@/components/Badges";
import { Plus, Search, Eye, Pencil } from "lucide-react";

const TITLES = {
  PPBJ: { h: "Permintaan Pengadaan Barang & Jasa", s: "Pengajuan kebutuhan barang/jasa dengan verifikasi anggaran." },
  PUM: { h: "Permohonan Uang Muka", s: "Permintaan dana cash advance sebelum realisasi transaksi." },
  PP: { h: "Permohonan Pembayaran", s: "Pengajuan pembayaran vendor lengkap dengan kalkulasi PPh & PPN." },
  PTUM: { h: "Pertanggungjawaban Uang Muka", s: "Settlement nota riil vs uang muka." },
};

export default function DocumentList({ docType }) {
  const [docs, setDocs] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tax, setTax] = useState(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [d, a, t] = await Promise.all([
      api.get(`/documents?doc_type=${docType}`),
      api.get("/accounts"),
      api.get("/tax-settings"),
    ]);
    setDocs(d.data); setAccounts(a.data); setTax(t.data);
    setLoading(false);
  }, [docType]);

  useEffect(() => { load(); }, [load]);

  const meta = TITLES[docType];
  const filtered = docs.filter((d) =>
    (d.no + " " + (d.kegiatan || "") + " " + (d.supplier || "") + " " + (d.keterangan || "")).toLowerCase().includes(q.toLowerCase()));

  const openView = async (id) => {
    const { data } = await api.get(`/documents/${id}`);
    setViewing(data);
  };

  return (
    <div className="space-y-5" data-testid={`list-${docType}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">{docType} · {meta.h}</h1>
          <p className="text-slate-500 text-sm mt-1">{meta.s}</p>
        </div>
        <button data-testid="create-document" onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Buat {docType}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input data-testid="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nomor / kegiatan / supplier…"
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">No. Dokumen</th>
                <th className="text-left px-4 py-3 font-semibold">Kegiatan</th>
                <th className="text-left px-4 py-3 font-semibold">Supplier</th>
                <th className="text-right px-4 py-3 font-semibold">Nilai</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Memuat…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Belum ada dokumen {docType}.</td></tr>}
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 hover:bg-teal-50/40" data-testid={`row-${d.id}`}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{d.no}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[240px] truncate">{d.kegiatan || d.keterangan || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{d.supplier || "-"}</td>
                  <td className="px-4 py-3 text-right tabular text-slate-800">{rupiah(d.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button data-testid={`view-${d.id}`} onClick={() => openView(d.id)} className="p-2 text-slate-500 hover:text-[#14758a] hover:bg-slate-100 rounded-md"><Eye className="w-4 h-4" /></button>
                      {["pending_approval", "rejected"].includes(d.status) && (
                        <button onClick={() => { setEditing(d); setShowForm(true); }} className="p-2 text-slate-500 hover:text-[#f2941f] hover:bg-slate-100 rounded-md"><Pencil className="w-4 h-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={`${editing ? "Edit" : "Buat"} ${docType} — ${meta.h}`} wide>
        {tax && <DocumentForm docType={docType} initial={editing} accounts={accounts} tax={tax}
          onSaved={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />}
      </Modal>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Detail Dokumen" wide>
        {viewing && <DocumentDetail doc={viewing} onChanged={() => { openView(viewing.id); load(); }} />}
      </Modal>
    </div>
  );
}
