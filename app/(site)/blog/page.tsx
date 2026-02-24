import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { stripHtml, formatDate, getFirstImage } from "@/lib/utils";
import { Metadata } from "next";

// 1. DİNAMİK METADATA (Layout Template Uyumluluğu Sağlandı)
export async function generateMetadata(): Promise<Metadata> {
  const { data: s } = await supabase.from("site_settings").select("*").single();
  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;

  return {
    // ÖNEMLİ: Sadece "Blog" yazıyoruz. 
    // Layout'taki template bunu "Blog | MEMONEX 3D" yapacaktır.
    title: "Blog", 
    description: s?.site_description_default || "3D baskı teknolojileri, malzeme bilimi ve inovasyon notları.",
    alternates: { canonical: `${s?.site_url || "https://memonex3d.com"}/blog` },
    openGraph: {
      title: `Teknik Blog - ${brand}`,
      description: s?.site_description_default,
      url: `${s?.site_url}/blog`,
      images: [{ url: s?.og_image_blog || s?.og_image_default || "/blog-og.jpg" }],
      siteName: brand,
      type: "website",
    }
  };
}

export default async function BlogPage() {
  const [postsRes, settingsRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").single()
  ]);

  const posts = postsRes.data || [];
  const s = settingsRes.data;
  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const siteUrl = s?.site_url || "https://memonex3d.com";

  // 2. SCHEMA.ORG (Google Blog Listeleme Verisi)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `${brandName} ${brandSuffix} Teknik Blog`,
    "description": "3D teknolojileri ve üretim süreçleri üzerine teknik içerikler.",
    "url": `${siteUrl}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": `${brandName} ${brandSuffix}`,
      "logo": {
        "@type": "ImageObject",
        "url": s?.og_image_default || `${siteUrl}/logo.png`
      }
    },
    "blogPost": posts.map((post) => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "url": `${siteUrl}/blog/${post.slug}`,
      "datePublished": post.created_at,
      "image": getFirstImage(post.content) || s?.og_image_default || `${siteUrl}/blog-placeholder.jpg`
    }))
  };

  return (
    <div className="bg-slate-50 min-h-screen py-32 px-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="mb-24 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-white border border-slate-200 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] shadow-sm">
            {s?.logo_subtext || "Teknik Günlük & İnovasyon"}
          </div>
          <h1 className="text-5xl md:text-[4.5rem] font-black text-slate-900 tracking-tighter mb-10 leading-[0.8] drop-shadow-sm uppercase">
            {brandName}<span className="text-blue-600 italic block md:inline ml-0 md:ml-4">{brandSuffix}</span> BLOG
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed italic opacity-80">
            &quot;{s?.brand_slogan || "Fikirleri gerçekliğe dönüştüren teknoloji notları."}&quot;
          </p>
        </header>

        {!posts.length ? (
          <div className="text-center py-40 bg-white/50 backdrop-blur-sm rounded-[4rem] border border-dashed border-slate-300">
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">
               {s?.blog_empty_msg || "Gelecek hikayelerimiz için hazırlık yapıyoruz..."}
             </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {posts.map((post, index) => {
              const thumbnail = getFirstImage(post.content);
              const cleanContent = stripHtml(post.excerpt || post.content);
              const preview = cleanContent.length > 85 
                ? cleanContent.substring(0, 85) + "..." 
                : cleanContent;

              return (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
                  <article className="h-full bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.1)] hover:-translate-y-3 flex flex-col">
                    
                    <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                      {thumbnail ? (
                        <Image 
                          src={thumbnail} 
                          alt={`${post.title} - ${brandName} Blog`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3} // İlk 3 post için LCP optimizasyonu
                          className="object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-5xl italic">
                          {brandName[0]}{brandSuffix[0]}
                        </div>
                      )}
                    </div>

                    <div className="p-10 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-8">
                        <span className="w-10 h-[2px] bg-blue-600 group-hover:w-16 transition-all duration-500"></span>
                        <time dateTime={post.created_at} className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] italic">
                          {formatDate(post.created_at)}
                        </time>
                      </div>
                      
                      <h2 className="text-2xl font-black text-slate-900 leading-tight mb-6 group-hover:text-blue-600 transition-colors tracking-tight uppercase">
                        {post.title}
                      </h2>
                      
                      <p className="text-slate-500 leading-relaxed text-sm mb-10 line-clamp-3 font-medium italic opacity-70">
                        {preview}
                      </p>

                      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] group-hover:text-blue-600 transition-all">
                          OKU +
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