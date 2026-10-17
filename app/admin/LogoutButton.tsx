"use client";

import { createBrowserClient } from "@supabase/ssr";

export default function LogoutButton() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // window.location kullanmak, çerezlerin temizlendiğinden emin olmak 
      // ve middleware'i tetiklemek için en temiz yoldur.
      window.location.href = "/admin/auth";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all group"
    >
      <span className="text-lg opacity-70 group-hover:scale-110 transition-transform">🚪</span>
      <span className="text-sm font-bold uppercase tracking-widest">Güvenli Çıkış</span>
    </button>
  );
}