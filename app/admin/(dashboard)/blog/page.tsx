// app/admin/blog/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { formatDate, getFirstImage } from "@/lib/utils";

export default async function AdminBlogList() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name: string) { return cookieStore.get(name)?.value } } }
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, content, published, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Üst Başlık Bölümü */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            BLOG <span className="text-blue-600">EDİTÖRÜ</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Toplam {posts?.length || 0} İçerik Yönetiliyor
          </p>
        </div>
        <Link 
          href="/admin/blog/new" 
          className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
        >
          + YENİ MAKALE OLUŞTUR
        </Link>
      </div>

      {/* Liste / Tablo Yapısı */}
      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kapak</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">İçerik Detayları</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Oluşturma</th>
                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Yönet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts && posts.length > 0 ? (
                posts.map((post) => {
                  const coverImage = getFirstImage(post.content);

                  return (
                    <tr key={post.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                      <td className="p-8 w-32">
                        <div className="w-20 h-14 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                          {coverImage ? (
                            <img 
                              src={coverImage} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">No Media</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-8">
                        <div className="max-w-md">
                          <div className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-blue-600 transition-colors leading-tight truncate">
                            {post.title}
                          </div>
                          <div className="text-[10px] text-blue-400 mt-1 font-bold italic tracking-wider">
                            memonex3d.com/blog/{post.slug}
                          </div>
                        </div>
                      </td>

                      <td className="p-8">
                        {post.published ? (
                          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            YAYINDA
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                            TASLAK
                          </div>
                        )}
                      </td>

                      <td className="p-8 text-[11px] text-slate-400 font-black uppercase tracking-tighter">
                        {formatDate(post.created_at)}
                      </td>

                      <td className="p-8 text-right">
                        <Link 
                          href={`/admin/blog/${post.id}`} 
                          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-90"
                        >
                          <span className="text-lg">✎</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-6xl opacity-20">📝</div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Henüz bir makale yazılmamış</p>
                      <Link href="/admin/blog/new" className="text-blue-600 font-black text-xs underline underline-offset-8">İlk yazını şimdi oluştur</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}