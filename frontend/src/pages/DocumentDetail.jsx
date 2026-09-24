import { useState } from "react";
import api, { rupiah } from "@/lib/api";
import { StatusBadge, DocTypeBadge } from "@/components/Badges";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, XCircle, BookOpen, Circle, Printer, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { printDocument } from "@/components/PrintDoc";

export default function DocumentDetail({ doc, onChanged }) {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const canApprove = ["admin", "approver", "keuangan"].includes(user?.role);
  const canJournal = ["admin", "keuangan"].includes(user?.role);

  const act = async (idx, action) => {
    setBusy(true);
    try {
      await api.post(`/documents/${doc.id}/approve`, { step_index: idx, action, note });
      toast.success(action === "approve" ? "Langkah disetujui" : "Dokumen ditolak");
      setNote("");
      onChanged();
    } catch (e) { toast.error(e.response?.data?.detail || "Gagal"); }
    finally { setBusy(false); }
  };

  const genJournal = async () => {
    setBusy(true);
    try {
      await api.post(`/documents/${doc.id}/generate-journal`);
      toast.success("Jurnal Umum berhasil dibuat");
      onChanged();
    } catch (e) { toast.error(e.response?.data?.detail || "Gagal membuat jurnal"); }
    finally { setBusy(false); }
  };

  const nextPending = (doc.approvals || []).findIndex((a) => a.status === "pending");

  return (
    <div className="space-y-5" data-testid="document-detail">
      <div className="flex flex-wrap items-center gap-3">
        <DocTypeBadge type={doc.doc_type} />
        <span className="font-mono text-sm text-slate-600">{doc.no}</span>
        <StatusBadge status={doc.status} />
        <button data-testid="print-document" onClick={() => printDocument(doc)}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50">
          <Printer className="w-4 h-4" /> Cetak PDF
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <Field label="Entitas" val={doc.entitas} />
        <Field label="Tanggal" val={doc.tanggal} />
        <Field label="Kegiatan" val={doc.kegiatan} />
        <Field label="Supplier/Penerima" val={doc.supplier} />
        <Field label="Status Anggaran" val={doc.anggaran_status} />
        <Field label="Nilai Total" val={rupiah(doc.total)} />
      </div>

      {doc.items?.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr><th className="text-left px-3 py-2">Uraian</th><th className="text-right px-2 py-2">Qty</th><th className="px-2 py-2">Sat</th><th className="text-right px-3 py-2">Harga</th><th className="text-right px-3 py-2">Total</th></tr>
            </thead>
            <tbody>
              {doc.items.map((it, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-700">{it.uraian}</td>
                  <td className="px-2 py-2 text-right tabular">{it.kuantitas}</td>
                  <td className="px-2 py-2 text-center text-slate-500">{it.satuan}</td>
                  <td className="px-3 py-2 text-right tabular">{rupiah(it.harga_estimasi)}</td>
                  <td className="px-3 py-2 text-right tabular text-slate-800">{rupiah(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(doc.doc_type === "PP" || doc.doc_type === "PTUM") && (
        <div className="bg-[#eef8f9] border border-[#b3e2e8] rounded-lg p-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="DPP" val={rupiah(doc.dpp || doc.total)} />
          <Field label="PPN" val={doc.ppn_enabled ? "Ya" : "Tidak"} />
          <Field label="PPh" val={doc.pph_code || "Tanpa PPh"} />
          <Field label="Faktur Pajak" val={doc.faktur_pajak || "-"} />
        </div>
      )}

      {doc.keterangan && <Field label="Keterangan" val={doc.keterangan} />}

      {doc.attachments?.length > 0 && (
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2"><Paperclip className="w-3.5 h-3.5" /> Lampiran Bukti</div>
          <ul className="space-y-1">
            {doc.attachments.map((a, i) => (
              <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                {a.name}
                {a.link && <a href={a.link} target="_blank" rel="noreferrer" className="text-[#14758a] hover:underline text-xs">({a.link})</a>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h4 className="font-heading font-semibold text-slate-900 text-sm mb-3">Matriks Otorisasi</h4>
        <div className="space-y-2">
          {(doc.approvals || []).map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white">
              {a.status === "approved" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                a.status === "rejected" ? <XCircle className="w-5 h-5 text-red-600" /> :
                <Circle className="w-5 h-5 text-slate-300" />}
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-800">{a.role_label}</div>
                {a.name && <div className="text-xs text-slate-500">{a.name} · {a.at ? new Date(a.at).toLocaleString("id-ID") : ""} {a.note && `· "${a.note}"`}</div>}
              </div>
              {canApprove && a.status === "pending" && i === nextPending && doc.status === "pending_approval" && (
                <div className="flex gap-2">
                  <button data-testid={`approve-step-${i}`} onClick={() => act(i, "approve")} disabled={busy}
                    className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-semibold">Setujui</button>
                  <button data-testid={`reject-step-${i}`} onClick={() => act(i, "reject")} disabled={busy}
                    className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold">Tolak</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {canApprove && doc.status === "pending_approval" && (
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan otorisasi (opsional)"
            className="mt-3 w-full border border-slate-300 rounded-md px-3 py-2 text-sm" data-testid="approval-note" />
        )}
      </div>

      {doc.status === "approved" && canJournal && !doc.journal_generated && (
        <button data-testid="generate-journal" onClick={genJournal} disabled={busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#f2941f] hover:bg-[#d98014] text-white font-semibold text-sm">
          <BookOpen className="w-4 h-4" /> Buat Jurnal Umum
        </button>
      )}
      {doc.journal_generated && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
          <BookOpen className="w-4 h-4" /> Jurnal Umum sudah dibuat. Lihat di menu <b>Jurnal Umum</b>.
        </div>
      )}
    </div>
  );
}

function Field({ label, val }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-slate-800">{val || "-"}</div>
    </div>
  );
}
