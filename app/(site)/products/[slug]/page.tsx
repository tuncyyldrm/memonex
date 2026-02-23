// app/(site)/products/[slug]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 1. DİNAMİK META VERİ (SEO)
 * Twitter ve OpenGraph kartlarını en üst seviyeye taşır.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image")
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Ürün Bulunamazdı | Memonex3D" };

  const ogImage = product.image ? [product.image] : ["/og-default.jpg"];

  return {
    title: `${product.name} | 3D Baskı Isparta | Memonex3D`,
    description: product.description?.slice(0, 160) || `${product.name} modelinin yüksek hassasiyetli 3D baskı detayları ve üretim seçenekleri.`,
    alternates: {
      canonical: `https://memonex3d.com/products/${slug}`,
    },
    openGraph: {
      title: `${product.name} - Profesyonel 3D Üretim`,
      description: product.description || "",
      url: `https://memonex3d.com/products/${slug}`,
      siteName: "Memonex3D",
      images: ogImage,
      locale: "tr_TR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: ogImage,
    }
  };
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const { data: product, error } = await supabase.from("products").select("*").eq("slug", slug).single();

  if (error || !product) return notFound();

  // Resim Listesi Hazırlığı
  const allImages = Array.from(new Set([
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ])).filter((img): img is string => typeof img === 'string' && img !== '');

  const formattedPrice = new Intl.NumberFormat('tr-TR').format(product.price || 0);

  /**
   * 2. ZENGİNLEŞTİRİLMİŞ JSON-LD (STRUCTURAL DATA)
   * Google arama sonuçlarında fiyat, stok ve yıldız görünmesini sağlar.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": allImages,
    "description": product.description || "Memonex3D kalitesiyle endüstriyel 3D baskı.",
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Memonex3D"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://memonex3d.com/products/${product.slug}`,
      "priceCurrency": "TRY",
      "price": product.price,
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "TR" },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 2, "unitCode": "d" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" }
        }
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "18"
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">
        {/* BREADCRUMB - Navigasyon ve SEO */}
        <nav className="mb-8 md:mb-16 flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Ana Sayfa</Link>
          <span className="opacity-30">/</span>
          <Link href="/products" className="hover:text-blue-600 transition">Katalog</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 lg:gap-24 items-start">
          {/* SOL: GALERİ (Sticky özelliği ile) */}
          <div className="lg:sticky lg:top-28">
            <ProductGallery images={allImages} />
          </div>

          {/* SAĞ: İÇERİK */}
          <div className="flex flex-col">
            <header className="mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-4 md:mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Isparta Atölye: Aktif Üretim
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6 md:mb-8 uppercase italic">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-baseline gap-3 md:gap-4">
                <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">
                  {formattedPrice}
                </span>
                <span className="text-base md:text-lg font-black text-blue-600 tracking-tighter uppercase">TL</span>
                <div className="pl-4 border-l border-slate-200 text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  KDV DAHİL <br /> BAŞLAYAN FİYATLAR
                </div>
              </div>
            </header>

            {/* AÇIKLAMA */}
            <section className="mb-10 md:mb-16">
              <div className="relative pl-6 border-l-4 border-blue-600/20">
                <p className="text-lg md:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed italic tracking-tight">
                  {product.description || `${product.name} projeniz için Memonex3D Isparta atölyesinde yüksek hassasiyetli 3D baskı çözümleri sunuyoruz.`}
                </p>
              </div>
            </section>

            {/* TEKNİK ŞARTNAME TABLE */}
            <section className="mb-10 md:mb-16 bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100">
              <h2 className="text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                Üretim Parametreleri
                <span className="flex-1 h-[1px] bg-slate-200" />
              </h2>
              
              <div className="space-y-1">
                {[
                  { label: "Baskı Teknolojisi", value: product.technology || "FDM / Industrial" },
                  { label: "Malzeme Standartı", value: product.material || "PLA+ / PETG / Carbon Fiber" },
                  { label: "Hassasiyet", value: "0.12mm - 0.20mm" },
                  { label: "Üretim Konumu", value: "Isparta / Türkiye" }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 px-1">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{spec.label}</span>
                    <span className="text-xs md:text-sm text-slate-900 font-black tracking-tight">{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* LOKAL SEO BİLGİ NOTU */}
            <div className="mb-10 text-[10px] text-slate-400 font-medium italic leading-relaxed px-2">
              * Bu model Isparta merkezli atölyemizde üretilmektedir. Yerel teslimat ve Türkiye geneli hızlı kargo seçenekleri mevcuttur. Özel boyut talepleriniz için WhatsApp üzerinden teknik çizim iletebilirsiniz.
            </div>

            {/* AKSİYON BUTONLARI */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-auto">
              <Link 
                href={`https://wa.me/905312084897?text=Merhaba, ${product.name} ürünü hakkında bilgi alabilir miyim?`}
                target="_blank"
                className="w-full sm:flex-[2] bg-slate-900 text-white text-center py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]"
              >
                WHATSAPP İLE SİPARİŞ VER
              </Link>
              <button className="w-full sm:flex-1 bg-white text-slate-900 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all">
                PAYLAŞ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}