import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";

export const revalidate = 86400; // 24 saatte bir yenile

// Sayfa verilerini ve site ayarlarını merkezi olarak çekiyoruz
const getPageData = cache(async (slug: string) => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  const [pageRes, settingsRes] = await Promise.all([
    supabase.from("pages").select("*").eq("slug", slug).single(),
    supabase.from("site_settings").select("*").single()
  ]);
    
  return { page: pageRes.data, s: settingsRes.data };
});

// 1. DİNAMİK METADATA (Layout Şablonu ile Tam Uyumlu)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { page, s } = await getPageData(slug);

  if (!page) return { title: "Sayfa Bulunamadı" };

  const siteUrl = s?.site_url || "https://memonex3d.com";
  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;
  
  // HTML taglerini temizleyerek temiz bir description oluşturuyoruz
  const cleanDescription = page.content
    ? page.content.replace(/<[^>]*>?/gm, '').substring(0, 155).trim()
    : s?.site_description_default;

  return {
    // Sadece sayfa başlığı; Layout otomatik olarak "Hakkımızda | MEMONEX 3D" yapacak
    title: page.title, 
    description: cleanDescription,
    alternates: { canonical: `${siteUrl}/${slug}` },
    openGraph: {
      title: `${page.title} - ${brand}`,
      description: cleanDescription,
      url: `${siteUrl}/${slug}`,
      type: 'article',
      siteName: brand,
      images: [{ url: s?.og_image_default || '/og-corporate.jpg' }],
    },
    robots: {
      // Yasal sayfaları arama sonuçlarından gizlemek isteyebilirsiniz (Opsiyonel)
      index: !['gizlilik-politikasi', 'cerez-politikasi', 'kullanim-kosullari'].includes(slug),
      follow: true,
    }
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { page, s } = await getPageData(slug);

  if (!page) notFound();

  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const fullBrand = `${brandName} ${brandSuffix}`;
  const siteUrl = s?.site_url || "https://memonex3d.com";

  // 2. SCHEMA.ORG (Kurumsal Sayfa ve Breadcrumb)
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": page.title,
      "description": page.title,
      "publisher": { 
        "@type": "Organization", 
        "name": fullBrand,
        "url": siteUrl,
        "logo": { "@type": "ImageObject", "url": s?.og_image_default || `${siteUrl}/logo.png` }
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": page.title, "item": `${siteUrl}/${slug}` }
      ]
    }
  ];

  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <article className="max-w-4xl mx-auto px-6 py-24 md:py-40">
        <header className="mb-20">
          <nav aria-label="Breadcrumb" className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
            <Link href="/" className="hover:text-blue-600 transition">Ana Sayfa</Link>
            <span>/</span>
            <span className="text-slate-900 font-black">{page.title}</span>
          </nav>

          <div className="inline-flex items-center gap-3 mb-8">
            <span className="h-[2px] w-12 bg-blue-600" />
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">
              {s?.logo_subtext || "Kurumsal Bilgi"}
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase text-slate-900 leading-[0.85] italic">
            {page.title}
          </h1>
        </header>

        {/* Kurumsal İçerik Alanı (Tailwind Typography ile) */}
        <section 
          className="prose prose-slate prose-lg max-w-none 
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase 
          prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900
          prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
          prose-ol:font-medium prose-ul:font-medium"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
        
        {/* Sayfa Altı Aksiyonları */}
        <footer className="mt-32 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest italic opacity-40">
              {fullBrand} • {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <PrintButton />
            <Link 
              href="/iletisim" 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
            >
              Destek Hattı
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}