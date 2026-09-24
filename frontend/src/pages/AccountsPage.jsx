import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const INP = "w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]";
const L = "block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5";
const CATS = ["Aset", "Kewajiban", "Ekuitas", "Pendapatan", "Beban"];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [f, setF] = useState({ code: "", name: "", category: "Beban", type: "", normal: "debit" });

  const load = useCallback(async () => { const { data } = await api.get("/accounts"); setAccounts(data); }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setF({ code: "", name: "", category: "Beban", type: "", normal: "debit" }); setOpen(true); };
  const openEdit = (a) => { setEditing(a); setF({ ...a }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/accounts/${editing.id}`, { ...f, id: editing.id });
      else await api.post("/accounts", f);
      toast.success("Akun tersimpan"); setOpen(false); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  const del = async (a) => {
    if (!window.confirm(`Hapus akun ${a.code}?`)) return;
    await api.delete(`/accounts/${a.id}`); toast.success("Akun dihapus"); load();
  };

  const filtered = accounts.filter((a) => (a.code + " " + a.name + " " + a.category).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5" data-testid="accounts-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Master Akun (COA)</h1>
          <p className="text-slate-500 text-sm mt-1">Chart of Accounts standar — sesuaikan dengan kode akun Accurate Online Anda.</p>
        </div>
        <button data-testid="add-account" onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Tambah Akun</button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari kode / nama akun…" className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]" />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Kode</th>
                <th className="text-left px-4 py-3 font-semibold">Nama Akun</th>
                <th className="text-left px-4 py-3 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 font-semibold">Tipe</th>
                <th className="text-left px-4 py-3 font-semibold">Saldo Normal</th>
                <th className="text-right px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.code} className="border-t border-slate-100 hover:bg-teal-50/40">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{a.code}</td>
                  <td className="px-4 py-2.5 text-slate-800">{a.name}</td>
                  <td className="px-4 py-2.5 text-slate-600">{a.category}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{a.type}</td>
                  <td className="px-4 py-2.5"><span className="text-xs capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-600">{a.normal}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-[#f2941f] hover:bg-slate-100 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(a)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Akun" : "Tambah Akun"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={L}>Kode Akun</label><input data-testid="account-code" required className={INP} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="6-10010" /></div>
            <div><label className={L}>Saldo Normal</label><select className={INP} value={f.normal} onChange={(e) => setF({ ...f, normal: e.target.value })}><option value="debit">Debit</option><option value="kredit">Kredit</option></select></div>
          </div>
          <div><label className={L}>Nama Akun</label><input data-testid="account-name" required className={INP} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={L}>Kategori</label><select className={INP} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className={L}>Tipe</label><input className={INP} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} placeholder="cth: Hutang Pajak" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border border-slate-300 text-sm">Batal</button><button type="submit" data-testid="save-account" className="px-5 py-2 rounded-md bg-[#14758a] text-white text-sm font-semibold">Simpan</button></div>
        </form>
      </Modal>
    </div>
  );
}
