import { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain mb-4" />
        <h2 className="font-heading text-xl font-bold text-slate-900 mb-1">Lupa Kata Sandi</h2>
        {sent ? (
          <p data-testid="forgot-sent" className="text-sm text-slate-600 mt-3">
            Jika email terdaftar, tautan reset telah dikirim. Periksa kotak masuk Anda.
          </p>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">Masukkan email Anda untuk menerima tautan reset.</p>
            {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              <input data-testid="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14758a]"
                placeholder="email@perusahaan.co.id" />
              <button data-testid="forgot-submit" disabled={loading}
                className="w-full bg-[#14758a] hover:bg-[#106071] text-white font-semibold py-2.5 rounded-md transition-colors disabled:opacity-60">
                {loading ? "Mengirim…" : "Kirim Tautan Reset"}
              </button>
            </form>
          </>
        )}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-[#14758a] hover:underline">Kembali ke halaman masuk</Link>
        </div>
      </div>
    </div>
  );
}
