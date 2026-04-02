import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import ShareButton from "@/components/ShareButton";
import { Metadata } from "next";
import { cache } from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. VERİ ÇEKME (CACHED)
const getProductData = cache(async (slug: string) => {
  const [productRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").eq("slug", slug).single(),
    supabase.from("site_settings").select("*").single()
  ]);
  return { product: productRes.data, s: settingsRes.data };
});

// 2. METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product, s } = await getProductData(slug);

  if (!product) return { title: "Ürün Bulunamadı" };

  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;
  const siteUrl = s?.site_url || "https://memonex3d.com";
  
  const title = product.name;
  const description = product.description?.slice(0, 160) || s?.site_description_default;
  
  // Resim URL'ini tam (absolute) hale getiriyoruz
  const imageUrl = product.image 
    ? product.image 
    : (s?.og_image_default || `${siteUrl}/og-image.jpg`);

  return {
    title: title, 
    description: description,
    alternates: { canonical: `${siteUrl}/products/${slug}` },
    openGraph: {
      title: `${title} - ${brand}`,
      description: description,
      url: `${siteUrl}/products/${slug}`,
      images: [{ 
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title 
      }],
      type: "article",
    },
    // --- TWITTER'IN LAYOUT'U EZMESİ İÇİN BURASI ŞART ---
    twitter: {
      card: "summary_large_image",
      title: `${title} - ${brand}`,
      description: description,
      images: [imageUrl], // Ürün resmini burada da dizi içinde belirtiyoruz
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const { product, s } = await getProductData(slug);

  if (!product) return notFound();

  const brandName = s?.brand_name || "MEMONEX";
  const siteUrl = s?.site_url || "https://memonex3d.com";

  const allImages = Array.from(new Set([
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ])).filter((img): img is string => typeof img === 'string' && img !== '');

  const formattedPrice = new Intl.NumberFormat('tr-TR').format(product.price || 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": allImages.length > 0 ? allImages : [`${siteUrl}/placeholder.jpg`],
    "description": product.description?.slice(0, 160),
    "brand": { "@type": "Brand", "name": brandName },
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/products/${product.slug}`,
      "priceCurrency": "TRY",
      "price": product.price || 0,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "priceValidUntil": "2026-12-31"
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Breadcrumb - Minimalist */}
        <nav className="mb-6 md:mb-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Ana Sayfa</Link>
          <span className="opacity-30">/</span>
          <Link href="/products" className="hover:text-blue-600 transition">Katalog</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 truncate max-w-[100px] md:max-w-none">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Sol: Görsel Galerisi */}
          <div className="lg:sticky lg:top-24">
            <ProductGallery images={allImages} />
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div className="flex flex-col">
            <header className="mb-6 md:mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                {brandName} ATÖLYE: AKTİF ÜRETİM
              </div>
              
              <h1 className="text-1xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-5 uppercase italic">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-3xl md:text-4xl font-black text-blue-600 tracking-tighter">
                  {formattedPrice}
                </span>
                <span className="text-sm md:text-base font-black text-blue-600 tracking-tighter uppercase">
                   {s?.price_currency || 'TL'}
                </span>
                <div className="pl-3 border-l border-slate-200 text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  KDV DAHİL <br /> BAŞLAYAN FİYATLAR
                </div>
              </div>
            </header>

            {/* Ürün Açıklaması - Satır sonu desteği eklendi */}
            <section className="mb-8 md:mb-10">
              <div className="relative pl-5 border-l-4 border-blue-600/20">
                <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed italic tracking-tight whitespace-pre-line">
                  {product.description || `${product.name} projeniz için yüksek hassasiyetli 3D baskı çözümleri sunuyoruz.`}
                </p>
              </div>
            </section>

            {/* Teknik Detaylar Kartı */}
            <section className="mb-8 md:mb-10 bg-slate-50/50 p-5 md:p-6 rounded-[1.5rem] border border-slate-100">
              <h2 className="text-slate-900 font-black text-[9px] uppercase tracking-[0.3em] mb-4 flex items-center gap-4">
                Üretim Parametreleri
                <span className="flex-1 h-[1px] bg-slate-200" />
              </h2>
              
              <div className="space-y-0.5">
                {[
                    { label: "Baskı Teknolojisi", value: product.technology || s?.default_tech },
                    { label: "Malzeme Standartı", value: product.material || s?.default_material },
                    { label: "Hassasiyet", value: product.default_precision || s?.default_precision },
                    { label: "Üretim Konumu", value: s?.workshop_address?.split(',')[0] || "Isparta / Türkiye" }
                  ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 px-1">
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{spec.label}</span>
                    <span className="text-xs md:text-sm text-slate-900 font-black tracking-tight">{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Aksiyon Butonları */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <Link 
                href={`https://wa.me/${s?.whatsapp_no}?text=${encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında bilgi almak ve sipariş vermek istiyorum.`)}`}
                target="_blank"
                className="w-full sm:flex-[3] bg-slate-900 text-white text-center py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center"
              >
                WHATSAPP İLE SİPARİŞ VER
              </Link>
              <ShareButton title={product.name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}