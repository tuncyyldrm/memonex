// app/admin/(dashboard)/pages/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminPages() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  );

  const { data: pages } = await supabase
    .from("pages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">SİSTE <span className="text-blue-600">SAYFALARI</span></h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Statik içerik yönetimi</p>
        </div>
        <Link 
          href="/admin/pages/new" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-500/20"
        >
          + YENİ SAYFA OLUŞTUR
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sayfa Başlığı</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Slug (URL)</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Son Güncelleme</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pages?.map((page) => (
              <tr key={page.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-900 uppercase text-xs tracking-tight">{page.title}</span>
                </td>
                <td className="px-8 py-5 italic text-blue-500 text-xs font-medium">/{page.slug}</td>
                <td className="px-8 py-5 text-slate-400 text-[10px] font-bold uppercase">
                  {new Date(page.updated_at).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-8 py-5 text-right">
                  <Link 
                    href={`/admin/pages/${page.id}`} 
                    className="text-slate-400 hover:text-blue-600 font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}