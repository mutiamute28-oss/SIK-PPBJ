import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import Modal from "@/components/Modal";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const INP = "w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]";
const L = "block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5";
const ROLES = [
  { v: "admin", l: "Admin" },
  { v: "keuangan", l: "Keuangan" },
  { v: "approver", l: "Approver (Otorisasi)" },
  { v: "user", l: "User (Pemohon)" },
];
const ROLE_CLS = { admin: "bg-purple-50 text-purple-700", keuangan: "bg-teal-50 text-teal-700", approver: "bg-blue-50 text-blue-700", user: "bg-slate-100 text-slate-600" };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [f, setF] = useState({ name: "", email: "", password: "", role: "user" });

  const load = useCallback(async () => { const { data } = await api.get("/users"); setUsers(data); }, []);
  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setF({ name: "", email: "", password: "", role: "user" }); setOpen(true); };
  const openEdit = (u) => { setEditing(u); setF({ name: u.name, email: u.email, password: "", role: u.role }); setOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/users/${editing.id}`, { name: f.name, role: f.role, password: f.password || undefined });
      else await api.post("/auth/register", { name: f.name, email: f.email, password: f.password, role: f.role });
      toast.success("Pengguna tersimpan"); setOpen(false); load();
    } catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  const del = async (u) => {
    if (!window.confirm(`Hapus pengguna ${u.email}?`)) return;
    try { await api.delete(`/users/${u.id}`); toast.success("Dihapus"); load(); }
    catch (err) { toast.error(err.response?.data?.detail || "Gagal"); }
  };

  return (
    <div className="space-y-5" data-testid="users-page">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl lg:text-3xl font-bold text-slate-900">Pengguna & Peran</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola akun sesuai matriks otorisasi perusahaan.</p>
        </div>
        <button data-testid="add-user" onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#14758a] hover:bg-[#106071] text-white text-sm font-semibold"><Plus className="w-4 h-4" /> Tambah Pengguna</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr><th className="text-left px-4 py-3 font-semibold">Nama</th><th className="text-left px-4 py-3 font-semibold">Email</th><th className="text-left px-4 py-3 font-semibold">Peran</th><th className="text-right px-4 py-3 font-semibold">Aksi</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-teal-50/40">
                <td className="px-4 py-3 text-slate-800 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${ROLE_CLS[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-1.5 text-slate-500 hover:text-[#f2941f] hover:bg-slate-100 rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(u)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit Pengguna" : "Tambah Pengguna"}>
        <form onSubmit={save} className="space-y-4">
          <div><label className={L}>Nama</label><input data-testid="user-name" required className={INP} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className={L}>Email</label><input data-testid="user-email" type="email" required disabled={!!editing} className={INP} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div><label className={L}>Kata Sandi {editing && <span className="text-slate-400 normal-case">(kosongkan jika tidak diubah)</span>}</label><input data-testid="user-password" type="password" className={INP} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
          <div><label className={L}>Peran</label><select data-testid="user-role" className={INP} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}</select></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border border-slate-300 text-sm">Batal</button><button type="submit" data-testid="save-user" className="px-5 py-2 rounded-md bg-[#14758a] text-white text-sm font-semibold">Simpan</button></div>
        </form>
      </Modal>
    </div>
  );
}
