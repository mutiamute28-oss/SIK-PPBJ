import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Save, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const INP = "w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]";

export default function TaxSettings() {
  const [ts, setTs] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/tax-settings").then((r) => setTs(r.data));
    api.get("/accounts").then((r) => setAccounts(r.data));
  }, []);

  if (!ts) return <div className="text-slate-500">Memuat…</div>;

  const setTax = (i, k, v) => setTs((p) => {
    const taxes = [...p.taxes];
    taxes[i] = { ...taxes[i], [k]: k === "rate" ? Number(v) : v };
    return { ...p, taxes };
  });
  const addTax = () => setTs((p) => ({ ...p, taxes: [...p.taxes, { code: "NEW" + p.taxes.length, name: "", rate: 0, account: accounts[0]?.code || "", kind: "wht", desc: "" }] }));
  const delTax = (i) => setTs((p) => ({ ...p, taxes: p.taxes.filter((_, x) => x !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/tax-settings", { ppn_rate: Number(ts.ppn_rate), ppn_account: ts.ppn_account, taxes: ts.taxes });
      setTs(data);
      toast.success("Pengaturan pajak tersimpan");
    } catch (e) { toast.error(e.response?.data?.detail || "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5" data-testid="tax-settings">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Pengaturan Pajak</h1>
          <p className="text-slate-500 text-sm mt-1">Tarif mengikuti ketentuan perpajakan Indonesia. Sesuaikan bila ada perubahan regulasi.</p>
        </div>
        <button data-testid="save-tax" onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold disabled:opacity-60">
          <Save className="w-4 h-4" /> {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>

      <div className="bg-[#eef8f9] border border-[#b3e2e8] rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tarif PPN (%)</label>
          <input data-testid="ppn-rate" type="number" step="0.01" className={INP} value={ts.ppn_rate} onChange={(e) => setTs({ ...ts, ppn_rate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Akun PPN Masukan</label>
          <select className={INP} value={ts.ppn_account} onChange={(e) => setTs({ ...ts, ppn_account: e.target.value })}>
            {accounts.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-slate-900">Jenis Pajak Penghasilan (PPh) & Tarif</h3>
          <button data-testid="add-tax" onClick={addTax} className="inline-flex items-center gap-1.5 text-sm text-[#14758a] font-medium hover:underline"><Plus className="w-4 h-4" /> Tambah</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Kode</th>
                <th className="text-left px-3 py-2 font-semibold">Nama Pajak</th>
                <th className="text-right px-3 py-2 font-semibold w-24">Tarif %</th>
                <th className="text-left px-3 py-2 font-semibold w-56">Akun Hutang Pajak</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {ts.taxes.map((t, i) => (
                <tr key={i} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2"><input className="w-24 px-2 py-1 border border-slate-200 rounded text-xs font-mono" value={t.code} onChange={(e) => setTax(i, "code", e.target.value)} /></td>
                  <td className="px-3 py-2">
                    <input data-testid={`tax-name-${i}`} className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={t.name} onChange={(e) => setTax(i, "name", e.target.value)} />
                    <input className="w-full px-2 py-1 mt-1 border border-slate-100 rounded text-xs text-slate-500" value={t.desc} onChange={(e) => setTax(i, "desc", e.target.value)} placeholder="keterangan" />
                  </td>
                  <td className="px-3 py-2"><input data-testid={`tax-rate-${i}`} type="number" step="0.01" className="w-20 px-2 py-1 border border-slate-200 rounded text-sm text-right" value={t.rate} onChange={(e) => setTax(i, "rate", e.target.value)} /></td>
                  <td className="px-3 py-2">
                    <select className="w-full px-2 py-1 border border-slate-200 rounded text-sm" value={t.account} onChange={(e) => setTax(i, "account", e.target.value)}>
                      {accounts.map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center"><button onClick={() => delTax(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
