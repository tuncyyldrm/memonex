import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { stripHtml, formatDate } from "@/lib/utils";

// Veri çekme fonksiyonunu bileşen dışına taşıyarak temiz tutuyoruz
async function getData() {
  const [blogRes, productRes] = await Promise.all([
    supabase.from("blog_posts")
      .select("id, title, slug, content, excerpt, featured_image, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
  ]);
  return { posts: blogRes.data || [], products: productRes.data || [] };
}

export default async function Home() {
  const { posts, products } = await getData();

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-blue-600 selection:text-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-24 px-6 text-center bg-slate-50 overflow-hidden">
        {/* Daha belirgin bir derinlik için çift katmanlı aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-blue-100/30 rounded-full blur-[140px] -z-10 animate-pulse" />
        
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Yeni Nesil Atölye</span>
          </div>

          <h1 className="text-6xl md:text-[9.5rem] font-black text-slate-900 tracking-tighter mb-10 leading-[0.8] drop-shadow-sm">
            MEMONEX<span className="text-blue-600 italic">3D</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed mb-14 max-w-2xl mx-auto italic opacity-90">
            "Fikirlerinizi milimetrik hassasiyetle somut gerçekliğe dönüştüren yüksek teknoloji üretim merkezi."
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link href="/products" className="group bg-slate-900 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200 active:scale-95 flex items-center gap-3">
              Kataloğu Keşfet <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="https://wa.me/905312084897" target="_blank" className="bg-white text-slate-900 border-2 border-slate-100 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-blue-600 transition-all active:scale-95">
              Hızlı Teklif
            </Link>
          </div>
        </div>
      </section>

      {/* --- ÜRÜNLER VİTRİNİ --- */}
      <section id="products" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-6">
          <div className="max-w-xl">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">
              Öne Çıkan <span className="text-blue-600">İşler</span>
            </h2>
            <p className="text-slate-500 mt-6 font-medium text-lg leading-relaxed">Endüstriyel parçalardan sanatsal modellere kadar geniş üretim yelpazemiz.</p>
          </div>
          <Link href="/products" className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-blue-600 transition-all flex items-center gap-4 group">
            TÜMÜNÜ GÖR <span className="w-12 h-[2px] bg-slate-200 group-hover:bg-blue-600 group-hover:w-20 transition-all"></span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-24">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group block">
              <div className="aspect-[1/1] bg-slate-100 rounded-[3rem] mb-8 overflow-hidden relative border border-slate-100 transition-all duration-700 group-hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.15)] group-hover:-translate-y-3">
                {product.image ? (
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    priority={false}
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-slate-200 text-8xl italic">M3D</div>
                )}
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              <div className="px-2">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none max-w-[70%]">
                    {product.name}
                  </h3>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">3D Print</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                   <p className="text-slate-900 font-black text-2xl tracking-tighter">
                     {new Intl.NumberFormat('tr-TR').format(product.price)} <span className="text-blue-600 text-sm italic ml-1">₺</span>
                   </p>
                   <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:border-slate-900 transition-all group-hover:text-white">
                     <span className="text-xl">↗</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- BLOG ÖNİZLEME (Teknik Günlük) --- */}
      <section id="blog" className="py-32 px-6 bg-slate-900 text-white rounded-[3rem] md:rounded-[5rem] mx-4 md:mx-8 my-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-0 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-10">
            <div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-6">TEKNİK<br/><span className="text-blue-500">GÜNLÜK</span></h2>
              <p className="text-slate-400 font-medium max-w-sm text-lg italic opacity-80">Malzeme bilimi ve 3D teknolojilerine dair derinlemesine incelemeler.</p>
            </div>
            <Link href="/blog" className="bg-white/5 border border-white/10 hover:bg-white hover:text-slate-900 px-14 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-black/50">BLOGU KEŞFET</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white/[0.03] rounded-[3.5rem] p-6 border border-white/[0.05] hover:border-blue-500/30 transition-all duration-700">
                <div className="aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden mb-10 relative shadow-2xl">
                  <Image 
                    src={post.featured_image || "/placeholder-blog.jpg"} 
                    alt={post.title} 
                    fill
                    className="object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-105" 
                  />
                </div>
                <div className="px-2 flex-grow flex flex-col">
                  <span className="text-blue-500 text-[10px] font-black tracking-[0.4em] uppercase mb-6 block">{formatDate(post.created_at)}</span>
                  <h3 className="text-2xl font-bold group-hover:text-blue-400 transition-colors mb-6 leading-tight uppercase tracking-tight">{post.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-medium italic opacity-60 mb-8">
                    {post.excerpt || stripHtml(post.content).substring(0, 100)}...
                  </p>
                  <div className="mt-auto pt-6 border-t border-white/10 text-xs font-black tracking-widest text-white/40 group-hover:text-blue-500 transition-colors uppercase">
                    İncele +
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-44 text-center bg-white px-6">
          <div className="max-w-4xl mx-auto bg-slate-50 py-28 px-8 rounded-[6rem] border border-slate-100 relative group">
            <div className="absolute top-0 right-0 w-32 h-32 border-r-8 border-t-8 border-blue-600/5 rounded-tr-[6rem] transition-all group-hover:border-blue-600/20" />
            <h2 className="text-6xl md:text-8xl font-black mb-14 tracking-tighter uppercase leading-[0.85]">
              HAYAL ET <br/> <span className="text-blue-600 italic">ÜRETELİM</span>.
            </h2>
            <Link href="https://wa.me/905312084897" target="_blank" className="inline-block bg-slate-900 text-white px-16 py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:scale-105 transition-all shadow-2xl shadow-blue-900/10">
              PROJENİ BAŞLAT
            </Link>
          </div>
      </section>
    </div>
  );
}