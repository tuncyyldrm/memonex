"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // SSR uyumlu client
import { useRouter } from "next/navigation";
import "@/app/globals.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // SSR uyumlu tarayıcı istemcisi
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Giriş başarısız: Bilgilerinizi kontrol edin.");
        setLoading(false);
        return;
      }

      if (data.session) {
        // Çerezlerin tarayıcıya yerleşmesi ve Middleware'in 
        // bunu algılaması için tam yönlendirme en güvenli yoldur.
        window.location.href = "/admin";
      }
    } catch (err) {
      setError("Beklenmedik bir hata oluştu.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            MEMONEX<span className="text-blue-600 italic">3D</span>
          </h1>
          <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-4" />
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Yönetici Paneli Erişimi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-[11px] font-bold p-4 rounded-2xl border border-red-100 text-center animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest ml-4 text-slate-400">E-Posta Adresi</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:bg-white rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-700 outline-none"
              placeholder="admin@memonex3d.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest ml-4 text-slate-400">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/10 focus:bg-white rounded-2xl px-6 py-4 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-slate-700 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                DOĞRULANIYOR...
              </span>
            ) : "SİSTEME GİRİŞ YAP"}
          </button>
        </form>
      </div>
    </div>
  );
}