import { useEffect, useState, useCallback } from "react";
import api, { rupiah, rupiahNum } from "@/lib/api";
import Modal from "@/components/Modal";
import { DocTypeBadge } from "@/components/Badges";
import { Download, FileSpreadsheet, Eye, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function JurnalUmum() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set("doc_type", filterType);
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const { data } = await api.get(`/journals?${params.toString()}`);
    setJournals(data); setLoading(false);
  }, [filterType, start, end]);

  useEffect(() => { load(); }, [load]);

  // Flatten to Accurate Online rows
  const flatRows = () => {
    const rows = [];
    journals.forEach((j) => {
      j.lines.forEach((l) => {
        rows.push({
          Tanggal: j.tanggal, "No Bukti": j.no_bukti, Keterangan: l.memo || j.keterangan,
          "Kode Akun": l.account_code, "Nama Akun": l.account_name,
          Debit: l.debit || 0, Kredit: l.kredit || 0,
          Departemen: j.unit_kerja || "", "Faktur Pajak": j.faktur_pajak || "",
        });
      });
    });
    return rows;
  };

  const exportCSV = () => {
    const rows = flatRows();
    if (!rows.length) { toast.error("Tidak ada data untuk diekspor"); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => {
      const v = String(r[h] ?? "").replace(/"/g, '""');
      return /[",\n]/.test(v) ? `"${v}"` : v;
    }).join(","))].join("\n");
    downloadBlob("\uFEFF" + csv, "text/csv;charset=utf-8;", "jurnal-umum-accurate.csv");
    toast.success("CSV berhasil diunduh");
  };

  const exportExcel = () => {
    const rows = flatRows();
    if (!rows.length) { toast.error("Tidak ada data untuk diekspor"); return; }
    const headers = Object.keys(rows[0]);
    const th = headers.map((h) => `<th style="background:#0d3c45;color:#fff;border:1px solid #ccc;padding:6px;text-align:left">${h}</th>`).join("");
    const trs = rows.map((r) => "<tr>" + headers.map((h) => {
      const num = h === "Debit" || h === "Kredit";
      return `<td style="border:1px solid #ccc;padding:6px;${num ? "text-align:right" : ""}">${num ? rupiahNum(r[h]) : (r[h] ?? "")}</td>`;
    }).join("") + "</tr>").join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table>${`<tr>${th}</tr>`}${trs}</table></body></html>`;
    downloadBlob(html, "application/vnd.ms-excel", "jurnal-umum-accurate.xls");
    toast.success("Excel berhasil diunduh");
  };

  const downloadBlob = (content, mime, filename) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const totalDebit = journals.reduce((s, j) => s + j.total_debit, 0);
  const totalKredit = journals.reduce((s, j) => s + j.total_kredit, 0);

  return (
    <div className="space-y-5" data-testid="jurnal-umum">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Jurnal Umum</h1>
          <p className="text-slate-500 text-sm mt-1">Output penjurnalan siap input ke Accurate Online, lengkap rincian pajak.</p>
        </div>
        <div className="flex gap-2">
          <button data-testid="export-csv" onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button data-testid="export-excel" onClick={exportExcel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#f2941f] hover:bg-[#d98014] text-white text-sm font-semibold">
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white border border-slate-200 rounded-lg p-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jenis</label>
          <select data-testid="filter-type" value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm">
            <option value="">Semua</option>
            <option>PPBJ</option><option>PUM</option><option>PP</option><option>PTUM</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Dari Tgl</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sampai Tgl</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border border-slate-300 rounded-md px-3 py-2 text-sm" />
        </div>
        {(start || end || filterType) && <button onClick={() => { setStart(""); setEnd(""); setFilterType(""); }} className="text-sm text-[#14758a] hover:underline">Reset</button>}
        <div className="ml-auto flex gap-4 text-sm">
          <div><span className="text-slate-400 text-xs uppercase">Σ Debit</span><div className="font-bold tabular text-slate-900">{rupiah(totalDebit)}</div></div>
          <div><span className="text-slate-400 text-xs uppercase">Σ Kredit</span><div className="font-bold tabular text-slate-900">{rupiah(totalKredit)}</div></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 font-semibold">No. Bukti</th>
                <th className="text-left px-4 py-3 font-semibold">Jenis</th>
                <th className="text-left px-4 py-3 font-semibold">Keterangan</th>
                <th className="text-right px-4 py-3 font-semibold">Debit</th>
                <th className="text-right px-4 py-3 font-semibold">Kredit</th>
                <th className="text-center px-4 py-3 font-semibold">Balance</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Memuat…</td></tr>}
              {!loading && journals.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Belum ada jurnal. Setujui dokumen lalu klik "Buat Jurnal Umum".
                </td></tr>
              )}
              {journals.map((j) => (
                <tr key={j.id} className="border-t border-slate-100 hover:bg-teal-50/40">
                  <td className="px-4 py-3 tabular text-slate-600">{j.tanggal}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">{j.no_bukti}</td>
                  <td className="px-4 py-3"><DocTypeBadge type={j.doc_type} /></td>
                  <td className="px-4 py-3 text-slate-700 max-w-[240px] truncate">{j.keterangan}</td>
                  <td className="px-4 py-3 text-right tabular text-slate-800">{rupiah(j.total_debit)}</td>
                  <td className="px-4 py-3 text-right tabular text-slate-800">{rupiah(j.total_kredit)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${j.balanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{j.balanced ? "Balance" : "Tidak"}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button data-testid={`view-journal-${j.id}`} onClick={() => setViewing(j)} className="p-2 text-slate-500 hover:text-[#14758a] hover:bg-slate-100 rounded-md"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={`Jurnal — ${viewing?.no_bukti || ""}`} wide>
        {viewing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <Info label="Tanggal" v={viewing.tanggal} />
              <Info label="No. Bukti" v={viewing.no_bukti} />
              <Info label="Supplier" v={viewing.supplier || "-"} />
              <Info label="Faktur Pajak" v={viewing.faktur_pajak || "-"} />
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                  <tr><th className="text-left px-3 py-2">Kode Akun</th><th className="text-left px-3 py-2">Nama Akun</th><th className="text-left px-3 py-2">Keterangan</th><th className="text-right px-3 py-2">Debit</th><th className="text-right px-3 py-2">Kredit</th></tr>
                </thead>
                <tbody>
                  {viewing.lines.map((l, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">{l.account_code}</td>
                      <td className="px-3 py-2 text-slate-700">{l.account_name}</td>
                      <td className="px-3 py-2 text-slate-500 text-xs">{l.memo}</td>
                      <td className="px-3 py-2 text-right tabular">{l.debit ? rupiah(l.debit) : "-"}</td>
                      <td className="px-3 py-2 text-right tabular">{l.kredit ? rupiah(l.kredit) : "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right uppercase text-xs text-slate-600">Total</td>
                    <td className="px-3 py-2 text-right tabular">{rupiah(viewing.total_debit)}</td>
                    <td className="px-3 py-2 text-right tabular">{rupiah(viewing.total_kredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, v }) {
  return <div><div className="text-[11px] font-semibold text-slate-400 uppercase">{label}</div><div className="text-slate-800">{v}</div></div>;
}
