import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image"; // Next Image eklendi
import { stripHtml, formatDate, getFirstImage } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  created_at: string;
}

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-slate-50 min-h-screen py-32 px-6 relative overflow-hidden">
      {/* Dekoratif Arka Plan (Ana sayfa ile bütünlük) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Başlık Alanı */}
        <header className="mb-24 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-slate-200 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] shadow-sm">
            Teknik Günlük & İnovasyon
          </div>
          <h1 className="text-6xl md:text-[5rem] font-black text-slate-900 tracking-tighter mb-8 uppercase leading-[0.9]">
            MEMONEX<span className="text-blue-600 italic">3D</span> BLOG
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
            "3D teknolojileri, malzeme bilimindeki son gelişmeler ve atölyemizden teknik notlar."
          </p>
        </header>

        {!posts?.length ? (
          <div className="text-center py-40 bg-white/50 backdrop-blur-sm rounded-[4rem] border border-dashed border-slate-300">
            <div className="text-slate-200 text-8xl mb-6 select-none italic font-black">M3D</div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs text-balance">
               Gelecek hikayelerimiz için hazırlık yapıyoruz...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {posts.map((post) => {
              const thumbnail = getFirstImage(post.content);
              const preview = post.excerpt
                ? stripHtml(post.excerpt)
                : stripHtml(post.content).substring(0, 120) + "...";

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <article className="h-full bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.1)] hover:-translate-y-3 flex flex-col">
                    
                    {/* Görsel Alanı */}
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                      {thumbnail ? (
                        <Image 
                          src={thumbnail} 
                          alt={post.title} 
                          fill
                          className="object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-5xl italic select-none">
                          M3D
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* İçerik Alanı */}
                    <div className="p-10 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-8">
                        <span className="w-10 h-[2px] bg-blue-600 group-hover:w-16 transition-all duration-500"></span>
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] italic">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl font-black text-slate-900 leading-tight mb-6 group-hover:text-blue-600 transition-colors tracking-tight uppercase">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-500 leading-relaxed text-sm mb-10 line-clamp-3 font-medium italic opacity-70">
                        {preview}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-blue-600 transition-all">
                          KEŞFET +
                        </span>
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <span className="text-lg">→</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}