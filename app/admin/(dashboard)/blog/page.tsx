import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { formatDate, getFirstImage } from "@/lib/utils"; // getFirstImage eklendi

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string; // Resim ayıklamak için content ekledik
  published: boolean;
  created_at: string;
}

export default async function AdminBlogList() {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      {/* Üst Kısım */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            İÇERİK YÖNETİMİ
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
            Toplam {posts?.length || 0} makale listeleniyor
          </p>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          + YENİ YAZI EKLE
        </Link>
      </div>

      {/* Modern Tablo Yapısı */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Önizleme</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Makale Bilgisi</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tarih</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts?.map((post) => {
                const coverImage = getFirstImage(post.content); // İçerikten ilk resmi al

                return (
                  <tr key={post.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* YENİ: Önizleme Görseli Hücresi */}
                    <td className="p-6 w-24">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                        {coverImage ? (
                          <img 
                            src={coverImage} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] font-black text-slate-300 italic">NO IMG</span>
                        )}
                      </div>
                    </td>

                    <td className="p-6">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {post.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono italic">
                        /{post.slug}
                      </div>
                    </td>

                    <td className="p-6">
                      {post.published ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          YAYINDA
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                          TASLAK
                        </span>
                      )}
                    </td>

                    <td className="p-6 text-sm text-slate-500 font-medium">
                      {formatDate(post.created_at)}
                    </td>

                    <td className="p-6 text-right">
                      <Link 
                        href={`/admin/blog/${post.id}`} 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        ✎
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}