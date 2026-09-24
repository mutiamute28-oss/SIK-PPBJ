import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import DocumentList from "@/pages/DocumentList";
import JurnalUmum from "@/pages/JurnalUmum";
import TaxSettings from "@/pages/TaxSettings";
import AccountsPage from "@/pages/AccountsPage";
import UsersPage from "@/pages/UsersPage";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === null)
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/ppbj" element={<Protected><DocumentList docType="PPBJ" /></Protected>} />
            <Route path="/pum" element={<Protected><DocumentList docType="PUM" /></Protected>} />
            <Route path="/pp" element={<Protected><DocumentList docType="PP" /></Protected>} />
            <Route path="/ptum" element={<Protected><DocumentList docType="PTUM" /></Protected>} />
            <Route path="/jurnal" element={<Protected><JurnalUmum /></Protected>} />
            <Route path="/pajak" element={<Protected><TaxSettings /></Protected>} />
            <Route path="/akun" element={<Protected><AccountsPage /></Protected>} />
            <Route path="/pengguna" element={<Protected><UsersPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
