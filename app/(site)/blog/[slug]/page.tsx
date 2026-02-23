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

// Okuma süresi hesaplama fonksiyonu
const calculateReadTime = (content: string) => {
  const wordsPerMinute = 200;
  const noHtml = content.replace(/<\/?[^>]+(>|$)/g, "");
  const words = noHtml.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Yazı Bulunamadı" };

  const description = post.excerpt || "Memonex3D teknik rehber ve 3D baskı dünyasından haberler.";

  return {
    title: `${post.title} | Memonex3D Blog`,
    description: description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: description,
      url: `${SITE_URL}/blog/${slug}`,
      images: post.image_url ? [{ url: post.image_url, width: 1200, height: 630, alt: post.title }] : [],
      type: "article",
      publishedTime: post.created_at,
      section: "3D Printing Technology",
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

  const readTime = calculateReadTime(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.title,
    "image": post.image_url,
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": { "@type": "Organization", "name": "Memonex3D", "url": SITE_URL },
    "publisher": {
      "@type": "Organization",
      "name": "Memonex3D",
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` }
    },
    "description": post.excerpt || post.title
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-600 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      
      {/* HEADER SECTION */}
      <header className="bg-gradient-to-b from-slate-50 to-white pt-10 pb-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="mb-12">
             <Link href="/blog" className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] inline-flex items-center gap-3 group">
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
              {readTime} Dakika Okuma
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-slate-200" />
              Teknik Analiz
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT ARTICLE */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {post.image_url && (
          <div className="relative aspect-video mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 group">
            <Image 
              src={post.image_url} 
              alt={post.title} 
              fill 
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        )}

        {/* PROSE SETTINGS: Teknik içerikler için optimize edildi */}
        <div 
          className="custom-content prose prose-slate prose-lg max-w-full 
                     prose-headings:text-[#0F172A] prose-headings:font-black prose-headings:uppercase 
                     prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:mb-8
                     prose-strong:text-slate-900 prose-strong:font-black
                     prose-blockquote:border-l-blue-600 prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl
                     prose-img:rounded-[2.5rem] prose-img:shadow-2xl
                     prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: post.content }} 
        />

        {/* CTA FOOTER */}
        <footer className="mt-32 pt-16 border-t border-slate-100">
          <div className="bg-slate-900 p-10 md:p-20 rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
            
            <div className="relative z-10 text-center md:text-left">
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Memonex3D Atölye</p>
              <h4 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
                Bu Yazıyı <br /> Projenize Uygulayın.
              </h4>
            </div>
            
            <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto">
                <Link 
                  href={`https://wa.me/905312084897?text=Merhaba, "${post.title}" yazınızı okudum ve bir projem hakkında görüşmek istiyorum.`}
                  className="px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all text-center shadow-lg"
                >
                  Teknik Destek Al
                </Link>
                <div className="flex gap-2">
                   <a href={`https://twitter.com/intent/tweet?url=${SITE_URL}/blog/${slug}`} target="_blank" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-slate-700">𝕏</a>
                   <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${SITE_URL}/blog/${slug}`} target="_blank" className="flex-1 py-4 bg-slate-800 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-slate-700">LinkedIn</a>
                </div>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}