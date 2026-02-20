// app/products/[slug]/page.tsx
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

// 1. DİNAMİK META VERİ (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: product } = await supabase
    .from("products")
    .select("name, description, image") // <-- BURAYA 'image' EKLEDİK
    .eq("slug", slug)
    .single();

  if (!product) return { title: "Ürün Bulunamazdı | Memonex3D" };

// app/products/[slug]/page.tsx içindeki ilgili satır
const ogImage = product.image ? [product.image] : ["/og-default.jpg"];

  return {
    title: `${product.name} | Memonex3D`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      images: ogImage,
    }
  };
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const { data: product, error } = await supabase.from("products").select("*").eq("slug", slug).single();

  if (error || !product) return notFound();

  // Resim Listesi
  const allImages = Array.from(new Set([
    product.image,
    ...(Array.isArray(product.gallery) ? product.gallery : [])
  ])).filter((img): img is string => typeof img === 'string' && img !== '');

  const formattedPrice = new Intl.NumberFormat('tr-TR').format(product.price || 0);

  // 2. JSON-LD (STRUCTURAL DATA) - GOOGLE İÇİN
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
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
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="bg-white min-h-screen selection:bg-blue-100 selection:text-blue-900">
      {/* JSON-LD Scriptini Sayfaya Ekle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-20">
        {/* NAVİGASYON (Breadcrumb SEO için de faydalıdır) */}
        <nav className="mb-8 md:mb-16 flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 overflow-hidden">
          <Link href="/" className="hover:text-blue-600 transition shrink-0">Ana Sayfa</Link>
          <span className="opacity-30">/</span>
          <Link href="/products" className="hover:text-blue-600 transition shrink-0">Katalog</Link>
          <span className="opacity-30">/</span>
          <span className="text-slate-900 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 lg:gap-24 items-start">
          {/* SOL: GALERİ */}
          <div className="lg:sticky lg:top-28">
            <ProductGallery images={allImages} />
          </div>

          {/* SAĞ: İÇERİK */}
          <div className="flex flex-col">
            <header className="mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-4 md:mb-6">
                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2 text-blue-600">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-blue-600"></span>
                </span>
                Aktif Üretim
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-6 md:mb-8 uppercase italic break-words">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-baseline gap-3 md:gap-4">
                <span className="text-4xl md:text-5xl font-black text-blue-600 tracking-tighter">
                  {formattedPrice}
                </span>
                <span className="text-base md:text-lg font-black text-blue-600 tracking-tighter uppercase">TL</span>
                <div className="pl-3 md:pl-4 border-l border-slate-200 text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                  KDV DAHİL <br /> BİRİM FİYAT
                </div>
              </div>
            </header>

            {/* AÇIKLAMA */}
            <section className="mb-10 md:mb-16">
              <div className="relative pl-6 border-l-4 border-blue-600/20">
                <p className="text-lg md:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed italic tracking-tight">
                  {product.description || "Memonex3D güvencesiyle yüksek hassasiyetli üretim."}
                </p>
              </div>
            </section>

            {/* TEKNİK ŞARTNAME */}
            <section className="mb-10 md:mb-16">
              <h2 className="text-slate-900 font-black text-[10px] md:text-[11px] uppercase tracking-[0.3em] mb-6 md:mb-8 flex items-center gap-4">
                Teknik Şartname
                <span className="flex-1 h-[1px] bg-slate-100" />
              </h2>
              
              <div className="space-y-1">
                {[
                  { label: "Baskı Teknolojisi", value: product.technology || "FDM / Industrial" },
                  { label: "Malzeme Standartı", value: product.material || "PLA+ / PETG" },
                  { label: "Katman Hassasiyeti", value: "0.12mm - 0.20mm" },
                  { label: "Lokasyon", value: "Isparta / Türkiye" }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between items-center py-3 md:py-4 border-b border-slate-50 px-1 hover:bg-slate-50/50 transition-colors">
                    <span className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">
                      {spec.label}
                    </span>
                    <span className="text-xs md:text-sm text-slate-900 font-black tracking-tight text-right ml-4">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* AKSİYON BUTONLARI */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-auto">
              <Link 
                href={`/iletisim?product=${product.slug}`} 
                className="w-full sm:flex-[2] bg-slate-900 text-white text-center py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
              >
                PROJE TEKLİFİ AL
              </Link>
              <button className="w-full sm:flex-1 bg-white text-slate-900 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all active:scale-[0.98]">
                PAYLAŞ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}