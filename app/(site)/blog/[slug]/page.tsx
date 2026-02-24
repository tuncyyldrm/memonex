import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";
import { cache } from "react";

export const revalidate = 3600;

// 1. DATA FETCHING (Cached)
const getPostData = cache(async (slug: string) => {
  const [postRes, settingsRes] = await Promise.all([
    supabase.from("blog_posts").select("*").eq("slug", slug).single(),
    supabase.from("site_settings").select("*").single()
  ]);
  return { post: postRes.data, s: settingsRes.data };
});

// Okuma süresi hesaplayıcı
const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const noHtml = content.replace(/<\/?[^>]+(>|$)/g, "");
  const words = noHtml.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

// 2. METADATA (Layout Template Uyumluluğu)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { post, s } = await getPostData(slug);

  if (!post) return { title: "Yazı Bulunamadı" };

  const siteUrl = s?.site_url || "https://memonex3d.com";
  
  return {
    // Sadece başlık; Layout bunu "Başlık | MEMONEX 3D" yapacak.
    title: post.title, 
    description: post.excerpt || post.title,
    alternates: { canonical: `${siteUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      url: `${siteUrl}/blog/${slug}`,
      images: post.featured_image ? [{ url: post.featured_image }] : [{ url: s?.og_image_blog || s?.og_image_default || "" }],
      type: "article",
      publishedTime: post.created_at,
    },
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, s } = await getPostData(slug);

  if (!post) notFound();

  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const siteUrl = s?.site_url || "https://memonex3d.com";
  const readTime = calculateReadTime(post.content);

  // 3. SCHEMA.ORG (Teknik Makale Verisi)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.featured_image || s?.og_image_default,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": { 
      "@type": "Organization", 
      "name": `${brandName} ${brandSuffix}`,
      "url": siteUrl
    },
    "publisher": { 
      "@type": "Organization", 
      "name": `${brandName} ${brandSuffix}`,
      "logo": { "@type": "ImageObject", "url": s?.og_image_default || `${siteUrl}/logo.png` }
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* HEADER SECTION */}
      <header className="bg-gradient-to-b from-slate-50 to-white pt-24 pb-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="mb-12">
            <Link href="/blog" className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] inline-flex items-center gap-3 group">
              <span className="w-8 h-[1px] bg-blue-600 group-hover:w-14 transition-all" />
              Blog'a Dön
            </Link>
          </nav>
          
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-10 tracking-tighter leading-[0.95] uppercase italic">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <time dateTime={post.created_at} className="flex items-center gap-3 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {formatDate(post.created_at)}
            </time>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-200" />
              {readTime} Dakika Okuma
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-200" />
              {s?.logo_subtext || "Teknik Blog"}
            </div>
          </div>
        </div>
      </header>

      {/* ARTICLE CONTENT */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <div 
          className="custom-content prose prose-slate prose-lg max-w-full 
                     prose-headings:text-[#0F172A] prose-headings:font-black prose-headings:uppercase 
                     prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
                     prose-strong:text-slate-900 prose-strong:font-black
                     prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-img:my-12
                     prose-blockquote:border-l-blue-600 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl
                     prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* CTA FOOTER */}
        <footer className="mt-32 pt-16 border-t border-slate-100">
          <div className="bg-slate-900 p-10 md:p-20 rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 text-center md:text-left">
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                {brandName}{brandSuffix} Atölye
              </p>
              <h4 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
                Bu Yazıyı <br /> Projenize Uygulayın.
              </h4>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
                <Link 
                  href={`https://wa.me/${s?.whatsapp_no}?text=${encodeURIComponent(`Merhaba, "${post.title}" yazınızı okudum. Bu konuda teknik destek almak istiyorum.`)}`}
                  target="_blank"
                  className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all text-center shadow-xl active:scale-95"
                >
                  Teknik Destek Al
                </Link>
                <div className="flex gap-2">
                   <a href={`https://twitter.com/intent/tweet?url=${siteUrl}/blog/${slug}&text=${encodeURIComponent(post.title)}`} target="_blank" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[9px] font-black text-center hover:bg-slate-700 transition-colors">𝕏 (Twitter)</a>
                   <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}/blog/${slug}`} target="_blank" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[9px] font-black text-center hover:bg-slate-700 transition-colors">LinkedIn</a>
                </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}