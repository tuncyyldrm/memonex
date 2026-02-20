// app/blog/[slug]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://memonex3d.com";

const getPost = cache(async (slug: string) => {
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  return post;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Yazı Bulunamadı" };

  const description = post.excerpt || "Memonex3D teknik rehber ve 3D baskı dünyasından haberler.";

  return {
    title: `${post.title} | Memonex3D Blog`,
    description: description,
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: description,
      url: `${SITE_URL}/blog/${slug}`,
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }] : [],
      type: "article",
      publishedTime: post.created_at,
      section: "3D Printing Technology",
      authors: ["Memonex3D"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: description,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  // SEO: Daha kapsamlı Article Şeması
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle", // Teknik bloglar için TechArticle daha spesifiktir
    "headline": post.title,
    "image": post.image_url,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": { 
      "@type": "Organization", 
      "name": "Memonex3D", 
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.png`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Memonex3D",
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` }
    },
    "description": post.excerpt || post.title,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ÜST HEADER */}
      <header className="bg-gradient-to-b from-slate-50 to-white pt-10 pb-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-12">
             <Link 
              href="/blog" 
              className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] inline-flex items-center gap-3 group"
            >
              <span className="w-8 h-[1px] bg-blue-600 group-hover:w-14 transition-all" />
              Geri Dön
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
              Memonex3D Teknik Kurul
            </div>
          </div>
        </div>
      </header>

      {/* ANA İÇERIK */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {post.image_url && (
          <div className="relative aspect-video mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 group">
            <Image 
              src={post.image_url} 
              alt={`${post.title} - Memonex3D Blog`} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        <div 
          className="custom-content prose prose-slate prose-lg max-w-full 
                     prose-headings:text-[#0F172A] prose-headings:font-black prose-headings:uppercase 
                     prose-p:text-slate-600 prose-p:leading-[1.9] prose-p:mb-8
                     prose-strong:text-slate-900 prose-strong:font-black
                     prose-li:text-slate-600 prose-li:mb-3
                     prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16
                     !break-normal overflow-wrap-normal [word-break:normal] [overflow-wrap:anywhere]"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* PAYLAŞIM VE AKSİYON */}
        <footer className="mt-32 pt-16 border-t border-slate-100">
          <div className="bg-slate-900 p-8 md:p-16 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-blue-900/10">
            <div className="text-center md:text-left">
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Üretim Zamanı</p>
              <h4 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none italic">
                Projenizi Birlikte <br className="hidden md:block" /> Başlatalım mı?
              </h4>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
                <Link 
                  href="/iletisim"
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all text-center"
                >
                  Teklif Al
                </Link>
                <div className="flex gap-2">
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${SITE_URL}/blog/${slug}`}
                    target="_blank"
                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl font-black text-[9px] uppercase tracking-widest text-center hover:bg-blue-400 transition-colors"
                  >
                    𝕏 Paylaş
                  </a>
                  <a 
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${SITE_URL}/blog/${slug}`}
                    target="_blank"
                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl font-black text-[9px] uppercase tracking-widest text-center hover:bg-[#0077b5] transition-colors"
                  >
                    LinkedIn
                  </a>
                </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}