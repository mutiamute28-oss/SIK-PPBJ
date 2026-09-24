import { useEffect, useState } from "react";
import api, { rupiah } from "@/lib/api";
import { Plus, Trash2, Paperclip } from "lucide-react";
import { toast } from "sonner";

const L = "block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5";
const INP = "w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a] focus:border-[#14758a]";

const DOC_META = {
  PPBJ: { title: "Permintaan Pengadaan Barang & Jasa", items: true, tax: false, subtypes: ["Rutin", "Investasi", "Tidak Rutin"], pay: "1-10002" },
  PUM: { title: "Permohonan Uang Muka", items: false, tax: false, advance: true, pay: "1-10002" },
  PP: { title: "Permohonan Pembayaran", items: false, tax: true, pay: "1-10002" },
  PTUM: { title: "Pertanggungjawaban Uang Muka", items: true, tax: true, settlement: true, pay: "1-10002" },
  KASKECIL: { title: "Permintaan Kas Kecil", items: true, tax: true, taxFromItems: true, pay: "1-10003" },
  NRP: { title: "No Receipt Payment", items: true, tax: false, pay: "1-10003" },
};

export default function DocumentForm({ docType, initial, accounts, tax, onSaved, onCancel }) {
  const meta = DOC_META[docType];
  const [f, setF] = useState(() => initial || {
    doc_type: docType, sub_type: meta.subtypes?.[0] || null,
    entitas: "POLITEKNIK HASNUR", unit_kerja: "", kegiatan: "", lokasi: "",
    anggaran_status: "Dianggarkan", tanggal: new Date().toISOString().slice(0, 10),
    supplier: "", keterangan: "", items: [{ uraian: "", kuantitas: 1, satuan: "Ls", harga_estimasi: 0, total: 0 }],
    dpp: 0, ppn_enabled: false, pph_code: "", faktur_pajak: "",
    expense_account: "6-10009", payment_account: meta.pay || "1-10002", advance_account: "1-10200",
    uang_muka_amount: 0, related_id: "", attachments: [],
  });
  const [saving, setSaving] = useState(false);
  const [pumOptions, setPumOptions] = useState([]);

  useEffect(() => {
    if (meta.settlement) api.get("/documents?doc_type=PUM").then((r) => setPumOptions(r.data.filter((d) => d.status === "posted" || d.status === "approved")));
  }, [meta.settlement]);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setItem = (i, k, v) => setF((p) => {
    const items = [...p.items];
    items[i] = { ...items[i], [k]: v };
    items[i].total = (Number(items[i].kuantitas) || 0) * (Number(items[i].harga_estimasi) || 0);
    return { ...p, items };
  });
  const addItem = () => setF((p) => ({ ...p, items: [...p.items, { uraian: "", kuantitas: 1, satuan: "Ls", harga_estimasi: 0, total: 0 }] }));
  const delItem = (i) => setF((p) => ({ ...p, items: p.items.filter((_, x) => x !== i) }));

  const setAtt = (i, k, v) => setF((p) => { const a = [...(p.attachments || [])]; a[i] = { ...a[i], [k]: v }; return { ...p, attachments: a }; });
  const addAtt = () => setF((p) => ({ ...p, attachments: [...(p.attachments || []), { name: "", link: "" }] }));
  const delAtt = (i) => setF((p) => ({ ...p, attachments: (p.attachments || []).filter((_, x) => x !== i) }));

  const itemsTotal = (f.items || []).reduce((s, it) => s + (Number(it.total) || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...f };
      if (!meta.items) payload.items = [];
      if (meta.taxFromItems) payload.dpp = itemsTotal;
      else if (meta.tax && !meta.settlement) payload.dpp = Number(f.dpp) || 0;
      if (meta.advance) payload.total = Number(f.uang_muka_amount) || 0;
      if (!payload.pph_code) payload.pph_code = null;
      payload.attachments = (f.attachments || []).filter((a) => a.name || a.link);
      if (initial?.id) await api.put(`/documents/${initial.id}`, payload);
      else await api.post("/documents", payload);
      toast.success("Dokumen tersimpan");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Gagal menyimpan");
    } finally { setSaving(false); }
  };

  const accOptions = (filter) => accounts.filter(filter).map((a) => (
    <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
  ));

  return (
    <form onSubmit={submit} className="space-y-5" data-testid="document-form">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={L}>Entitas / Unit Kerja</label>
          <input data-testid="form-entitas" className={INP} value={f.entitas} onChange={(e) => set("entitas", e.target.value)} />
        </div>
        <div>
          <label className={L}>Tanggal</label>
          <input data-testid="form-tanggal" type="date" className={INP} value={f.tanggal} onChange={(e) => set("tanggal", e.target.value)} />
        </div>
        {meta.subtypes && (
          <div>
            <label className={L}>Jenis PPBJ</label>
            <select data-testid="form-subtype" className={INP} value={f.sub_type || ""} onChange={(e) => set("sub_type", e.target.value)}>
              {meta.subtypes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className={L}>Status Anggaran</label>
          <select data-testid="form-anggaran" className={INP} value={f.anggaran_status} onChange={(e) => set("anggaran_status", e.target.value)}>
            <option>Dianggarkan</option>
            <option>Tidak Dianggarkan</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={L}>Kegiatan / Proyek</label>
          <input data-testid="form-kegiatan" className={INP} value={f.kegiatan} onChange={(e) => set("kegiatan", e.target.value)} placeholder="cth: Perbaikan Mobil APV / Konsumsi Tim Akreditasi" />
        </div>
        <div>
          <label className={L}>Supplier / Penerima</label>
          <input data-testid="form-supplier" className={INP} value={f.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="Nama vendor / karyawan" />
        </div>
        <div>
          <label className={L}>Lokasi</label>
          <input className={INP} value={f.lokasi} onChange={(e) => set("lokasi", e.target.value)} />
        </div>
      </div>

      {meta.settlement && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={L}>Uang Muka Terkait (PUM)</label>
            <select data-testid="form-related-pum" className={INP} value={f.related_id || ""}
              onChange={(e) => {
                const p = pumOptions.find((x) => x.id === e.target.value);
                setF((prev) => ({ ...prev, related_id: e.target.value, uang_muka_amount: p ? p.total : prev.uang_muka_amount }));
              }}>
              <option value="">— Pilih PUM —</option>
              {pumOptions.map((p) => <option key={p.id} value={p.id}>{p.no} · {rupiah(p.total)}</option>)}
            </select>
          </div>
          <div>
            <label className={L}>Jumlah Uang Muka Diterima</label>
            <input data-testid="form-uangmuka" type="number" className={INP} value={f.uang_muka_amount} onChange={(e) => set("uang_muka_amount", e.target.value)} />
          </div>
        </div>
      )}

      {meta.items && (
        <div>
          <label className={L}>Rincian Barang / Jasa</label>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold">Uraian</th>
                  <th className="text-right px-2 py-2 font-semibold w-16">Qty</th>
                  <th className="text-left px-2 py-2 font-semibold w-20">Satuan</th>
                  <th className="text-right px-2 py-2 font-semibold w-32">Harga</th>
                  <th className="text-right px-3 py-2 font-semibold w-32">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {f.items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-1.5"><input data-testid={`item-uraian-${i}`} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={it.uraian} onChange={(e) => setItem(i, "uraian", e.target.value)} placeholder="Uraian spesifikasi" /></td>
                    <td className="px-2 py-1.5"><input type="number" className="w-full px-1 py-1 border border-slate-200 rounded text-sm text-right" value={it.kuantitas} onChange={(e) => setItem(i, "kuantitas", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input className="w-full px-1 py-1 border border-slate-200 rounded text-sm" value={it.satuan} onChange={(e) => setItem(i, "satuan", e.target.value)} /></td>
                    <td className="px-2 py-1.5"><input type="number" className="w-full px-1 py-1 border border-slate-200 rounded text-sm text-right" value={it.harga_estimasi} onChange={(e) => setItem(i, "harga_estimasi", e.target.value)} /></td>
                    <td className="px-3 py-1.5 text-right tabular text-slate-700">{rupiah(it.total)}</td>
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" onClick={() => delItem(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50">
                  <td colSpan={4} className="px-3 py-2 text-right font-semibold text-slate-600 uppercase text-xs">Total</td>
                  <td className="px-3 py-2 text-right font-bold tabular text-slate-900">{rupiah(itemsTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button type="button" onClick={addItem} data-testid="add-item" className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#14758a] font-medium hover:underline">
            <Plus className="w-4 h-4" /> Tambah Baris
          </button>
        </div>
      )}

      {meta.advance && (
        <div>
          <label className={L}>Jumlah Uang Muka Diajukan</label>
          <input data-testid="form-amount" type="number" className={INP} value={f.uang_muka_amount} onChange={(e) => set("uang_muka_amount", e.target.value)} />
        </div>
      )}

      {meta.tax && (
        <div className="bg-[#eef8f9] border border-[#b3e2e8] rounded-lg p-4 space-y-4">
          <div className="text-sm font-heading font-semibold text-[#0d3c45]">Pemeriksaan Pajak (Indonesia)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!meta.settlement && !meta.taxFromItems && (
              <div>
                <label className={L}>DPP (Dasar Pengenaan Pajak)</label>
                <input data-testid="form-dpp" type="number" className={INP} value={f.dpp} onChange={(e) => set("dpp", e.target.value)} />
              </div>
            )}
            {meta.taxFromItems && (
              <div>
                <label className={L}>DPP (dari total rincian)</label>
                <input className={`${INP} bg-slate-100`} value={rupiah(itemsTotal)} readOnly />
              </div>
            )}
            <div className="flex items-end gap-2 pb-1">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input data-testid="form-ppn" type="checkbox" checked={f.ppn_enabled} onChange={(e) => set("ppn_enabled", e.target.checked)} className="w-4 h-4 accent-[#14758a]" />
                Kenakan PPN {tax?.ppn_rate || 11}% (PPN Masukan)
              </label>
            </div>
            <div>
              <label className={L}>Jenis PPh Dipotong</label>
              <select data-testid="form-pph" className={INP} value={f.pph_code || ""} onChange={(e) => set("pph_code", e.target.value)}>
                <option value="">— Tanpa PPh —</option>
                {(tax?.taxes || []).filter((t) => t.kind === "wht").map((t) => (
                  <option key={t.code} value={t.code}>{t.name} ({t.rate}%)</option>
                ))}
              </select>
            </div>
            <div>
              <label className={L}>No. Faktur Pajak</label>
              <input data-testid="form-faktur" className={INP} value={f.faktur_pajak} onChange={(e) => set("faktur_pajak", e.target.value)} placeholder="opsional" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={L}>{meta.advance ? "Akun Uang Muka" : "Akun Beban / Aset (Debit)"}</label>
          <select data-testid="form-expense-account" className={INP}
            value={meta.advance ? f.advance_account : f.expense_account}
            onChange={(e) => set(meta.advance ? "advance_account" : "expense_account", e.target.value)}>
            {meta.advance ? accOptions((a) => a.type === "Uang Muka") : accOptions((a) => a.category === "Beban" || a.category === "Aset")}
          </select>
        </div>
        {meta.settlement && (
          <div>
            <label className={L}>Akun Uang Muka</label>
            <select className={INP} value={f.advance_account} onChange={(e) => set("advance_account", e.target.value)}>
              {accOptions((a) => a.type === "Uang Muka")}
            </select>
          </div>
        )}
        <div>
          <label className={L}>Akun Kas / Bank (Kredit)</label>
          <select data-testid="form-payment-account" className={INP} value={f.payment_account} onChange={(e) => set("payment_account", e.target.value)}>
            {accOptions((a) => a.type === "Kas/Bank" || a.type === "Hutang")}
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5"><Paperclip className="w-3.5 h-3.5" /> Lampiran Bukti (nama / link)</label>
          <button type="button" onClick={addAtt} data-testid="add-attachment" className="inline-flex items-center gap-1 text-xs text-[#14758a] font-medium hover:underline"><Plus className="w-3.5 h-3.5" /> Tambah</button>
        </div>
        <div className="space-y-2">
          {(f.attachments || []).length === 0 && <p className="text-xs text-slate-400">Belum ada lampiran. Contoh: "Nota SPBU" / link Google Drive.</p>}
          {(f.attachments || []).map((a, i) => (
            <div key={i} className="flex gap-2">
              <input data-testid={`att-name-${i}`} className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Nama bukti (cth: Nota Konsumsi)" value={a.name} onChange={(e) => setAtt(i, "name", e.target.value)} />
              <input className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm" placeholder="Link (opsional)" value={a.link} onChange={(e) => setAtt(i, "link", e.target.value)} />
              <button type="button" onClick={() => delAtt(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className={L}>Keterangan / Alasan Permohonan</label>
        <textarea data-testid="form-keterangan" className={INP} rows={2} value={f.keterangan} onChange={(e) => set("keterangan", e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">Batal</button>
        <button type="submit" disabled={saving} data-testid="form-submit" className="px-5 py-2 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold disabled:opacity-60">
          {saving ? "Menyimpan…" : "Simpan Pengajuan"}
        </button>
      </div>
    </form>
  );
}
