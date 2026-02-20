import Link from "next/link";
import LogoutButton from "@/app/admin/LogoutButton"; 
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import "@/app/globals.css";

// Menü öğelerini "Sayfa Yönetimi" eklenecek şekilde güncelledik
const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "📊", id: "dashboard" },
  { label: "Sayfa Yönetimi", href: "/admin/pages", icon: "📄", id: "pages" }, // Yeni eklenen
  { label: "Blog Yönetimi", href: "/admin/blog", icon: "📝", id: "blog" },
  { label: "Ürün Kataloğu", href: "/admin/products", icon: "📦", id: "products" },
  { label: "Medya Galeri", href: "/admin/media", icon: "🖼️", id: "media" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const userMail = user?.email || "";
  const userName = userMail ? userMail.split('@')[0].toUpperCase() : "";
  const avatarLabel = userName ? userName.slice(0, 2) : "";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] antialiased text-slate-900">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-72 bg-[#0F172A] text-slate-400 flex flex-col z-50 shadow-2xl">
        <div className="p-8 mb-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-all shadow-lg shadow-blue-500/20 text-lg">M</div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white leading-none uppercase">
                MEMONEX<span className="text-blue-500 italic">3D</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase mt-1">Control Center</span>
            </div>
          </Link>
        </div>

        {/* Güncellenmiş Navigasyon Listesi */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link 
              key={item.id} 
              href={item.href} 
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-white/5 hover:text-white transition-all group relative border border-transparent hover:border-white/5"
            >
              <span className="text-xl opacity-60 group-hover:opacity-100">{item.icon}</span>
              <span className="font-bold text-[11px] uppercase tracking-[0.15em]">{item.label}</span>
              {/* Aktif öğe göstergesi için şık bir dokunuş eklenebilir */}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-xs font-bold uppercase tracking-widest">
              🏠 Site Önizleme
            </Link>
            {user && <LogoutButton />}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pl-72 flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Aktif</span>
                </div>
                <h1 className="text-sm font-black text-slate-900 mt-0.5 uppercase tracking-tight italic">
                  Hoş Geldin, <span className="text-blue-600">{userName}</span>
                </h1>
              </>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end border-r border-slate-200 pr-6">
                 <span className="text-[10px] font-black text-slate-900 leading-none mb-1 lowercase">{userMail}</span>
                 <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">Erişim: Yönetici</span>
               </div>
               <div className="w-11 h-11 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-xl shadow-slate-900/10">
                 {avatarLabel}
               </div>
            </div>
          )}
        </header>

        <section className="p-10 flex-1">
          <div className="bg-white rounded-[3rem] border border-slate-200/50 shadow-sm p-10 min-h-[calc(100vh-160px)] relative overflow-hidden">
            <div className="relative z-10">{children}</div>
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none text-[15rem] font-black italic select-none uppercase">M3D</div>
          </div>
        </section>
      </main>
    </div>
  );
}