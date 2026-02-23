// app/(site)/[slug]/page.tsx
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export const revalidate = 86400;

const getPage = cache(async (slug: string) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();
    
  return page;
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return { title: "Sayfa Bulunamadı | Memonex3D" };

  // HTML etiketlerini temizle ve açıklama oluştur
  const cleanDescription = page.content
    .replace(/<[^>]*>?/gm, '')
    .substring(0, 155)
    .trim();

  return {
    title: `${page.title} | Memonex3D`,
    description: cleanDescription,
    alternates: { canonical: `https://memonex3d.com/${slug}` },
    openGraph: {
      title: page.title,
      description: cleanDescription,
      url: `https://memonex3d.com/${slug}`,
      type: 'website',
      images: [{ url: '/og-corporate.jpg', width: 1200, height: 630 }], // Sabit bir kurumsal OG görseli
    },
    robots: {
      index: !['gizlilik-politikasi', 'cerez-politikasi'].includes(slug),
      follow: true,
    }
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) notFound();

  // SEO: Breadcrumb ve WebPage Şemaları
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "description": page.title,
      "publisher": { "@type": "Organization", "name": "Memonex3D" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://memonex3d.com" },
        { "@type": "ListItem", "position": 2, "name": page.title, "item": `https://memonex3d.com/${slug}` }
      ]
    }
  ];

  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <article className="max-w-4xl mx-auto px-6 py-24 md:py-40">
        <header className="mb-20">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Link href="/" className="hover:text-blue-600 transition">Ana Sayfa</Link>
            <span>/</span>
            <h2 className="text-slate-900 font-black">{page.title}</h2>
          </nav>

          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-[2px] w-12 bg-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Kurumsal</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-slate-900 leading-[0.85] italic">
            {page.title}
          </h1>
        </header>

        {/* İçerik */}
        <section 
          className="prose prose-slate prose-lg max-w-none 
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase 
          prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
        
        <footer className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-slate-900 text-xs font-black uppercase tracking-widest italic">Memonex3D / 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <PrintButton />
            <Link href="/iletisim" className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition">
              İletişime Geç
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}