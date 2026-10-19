import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 2. Verileri Paralel Çekme (Hız için Promise.all)
  const [blogRes, productRes, messageRes] = await Promise.all([
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("contact_messages").select("*", { count: "exact", head: true })
  ]);

  const stats = [
    { name: "Toplam Ürün", value: productRes.count ?? 0, icon: "📦", color: "bg-blue-600" },
    { name: "Blog Yazıları", value: blogRes.count ?? 0, icon: "📝", color: "bg-slate-900" },
    { name: "İletişim Mesajları", value: messageRes.count ?? 0, icon: "📧", color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Üst Başlık Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900">
            SİSTEM <span className="text-blue-600">ÖZETİ</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">
            Gerçek zamanlı veritabanı analizi
          </p>
        </div>
        <Link 
          href="/" 
          target="_blank" 
          className="group flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95 w-full sm:w-auto"
        >
          SİTEYİ GÖRÜNTÜLE <span className="group-hover:translate-x-1 transition-transform">↗</span>
        </Link>
      </div>

      {/* Dinamik İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((item) => (
          <div key={item.name} className="bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all group relative overflow-hidden shadow-sm hover:shadow-xl">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${item.color} rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{item.name}</p>
            <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tighter">
              {item.value.toLocaleString()}
            </p>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-6xl sm:text-8xl font-black italic select-none group-hover:opacity-[0.07] transition-opacity">
                {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Operasyon Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
        {/* Ürün Kartı */}
        <div className="bg-slate-900 rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 text-white relative overflow-hidden group border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-600 text-[9px] sm:text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">Envanter</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-3 sm:mb-4 leading-none">ÜRÜN<br/>YÖNETİMİ</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6 sm:mb-10 max-w-xs leading-relaxed italic">
              Şu anda sistemde <b className="text-white">{productRes.count ?? 0}</b> aktif model bulunuyor.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link href="/admin/products/new" className="bg-blue-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-blue-600/20 text-center">
                + MODEL EKLE
              </Link>
              <Link href="/admin/products" className="bg-white/5 border border-white/10 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all text-center">
                TÜM LİSTE
              </Link>
            </div>
          </div>
          <span className="absolute -bottom-10 -right-10 text-[8rem] sm:text-[12rem] font-black italic opacity-[0.05] select-none group-hover:scale-110 transition-transform duration-700 pointer-events-none">M3D</span>
        </div>

        {/* Blog Kartı */}
        <div className="bg-white rounded-2xl sm:rounded-[3rem] p-6 sm:p-10 border border-slate-200 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <span className="bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">İçerik</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase mb-3 sm:mb-4 text-slate-900 leading-none">BLOG /<br/>REHBER</h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mb-6 sm:mb-10 max-w-xs leading-relaxed italic">
              Toplam <b className="text-slate-900">{blogRes.count ?? 0}</b> teknik yazı yayında.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Link href="/admin/blog/new" className="bg-slate-900 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/20 text-center">
                + YAZI YAZ
              </Link>
              <Link href="/admin/blog" className="bg-slate-50 text-slate-900 border border-slate-200 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all text-center">
                DÜZENLE
              </Link>
            </div>
          </div>
          <span className="absolute -bottom-10 -right-10 text-[8rem] sm:text-[12rem] font-black italic opacity-[0.02] select-none group-hover:scale-110 transition-transform duration-700 uppercase pointer-events-none">Edit</span>
        </div>
      </div>
    </div>
  );
}