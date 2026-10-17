import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminPages() {
  const supabase = await createClient();

  const { data: pages } = await supabase
    .from("pages")
    .select("id, title, slug, updated_at, seo_title") // Şemadaki kolonlar
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            SİSTEM <span className="text-blue-600">SAYFALARI</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
            Statik içerik ve SEO yönetimi
          </p>
        </div>
        <Link 
          href="/admin/pages/new" 
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          + YENİ SAYFA OLUŞTUR
        </Link>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sayfa / SEO Başlığı</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug (URL)</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Güncelleme</th>
              <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pages && pages.length > 0 ? (
              pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 uppercase text-[11px] tracking-tight">
                        {page.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium italic">
                        SEO: {page.seo_title || "Tanımlanmamış"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 italic text-blue-600 text-xs font-bold tracking-tight">
                    /{page.slug}
                  </td>
                  <td className="px-8 py-6 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                    {new Date(page.updated_at).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link 
                      href={`/admin/pages/${page.id}`} 
                      className="inline-flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-900 hover:bg-blue-600 hover:text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all"
                    >
                      DÜZENLE
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <span className="text-4xl">📄</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Henüz sayfa oluşturulmadı</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}