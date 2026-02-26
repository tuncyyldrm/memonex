import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { cache } from "react";

export const revalidate = 3600; // 1 saatlik ISR (Incremental Static Regeneration)

// 1. DATA FETCHING (Cache & Performance)
const getCatalogData = cache(async () => {
  const [productsRes, settingsRes] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").single()
  ]);
  return { products: productsRes.data, s: settingsRes.data };
});

// 2. METADATA (Layout Template uyumlu)
export async function generateMetadata(): Promise<Metadata> {
  const { s } = await getCatalogData();
  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;
  
  return {
    // Sadece sayfa adını yazıyoruz, Layout otomatik olarak " | Brand" ekleyecek.
    title: "Ürün Kataloğu", 
    description: s?.site_description_default || "Profesyonel 3D baskı modelleri ve endüstriyel çözümler.",
    alternates: { canonical: `${s?.site_url || "https://memonex3d.com"}/products` },
    openGraph: {
      title: `Ürün Kataloğu - ${brand}`,
      description: "Yüksek hassasiyetli 3D baskı çözümlerimizi inceleyin.",
      url: `${s?.site_url}/products`,
      images: [{ url: s?.og_image_products || s?.og_image_default || "/og-products.jpg" }],
    },
  };
}

export default async function ProductsPage() {
  const { products, s } = await getCatalogData();
  
  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const siteUrl = s?.site_url || "https://memonex3d.com";

  // 3. SCHEMA.ORG (Google Katalog Verisi)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${brandName} ${brandSuffix} Katalog`,
    "description": "3D Baskı ve tasarım ürünleri listesi",
    "numberOfItems": products?.length || 0,
    "itemListElement": products?.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${siteUrl}/products/${product.slug}`,
      "name": product.name,
      "image": product.image || s?.og_image_default || `${siteUrl}/placeholder.jpg`
    }))
  };

  return (
    <div className="bg-white min-h-screen py-24 px-6 relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      {/* Arka Plan Efekti */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header Bölümü */}
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-slate-100 pb-12">
          <div className="max-w-2xl">
            <div className="inline-block px-3 py-1 mb-4 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-md">
              {brandName}{brandSuffix} ENVANTER
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
              3D <span className="text-blue-600 italic">KATALOG</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed mt-6 italic opacity-80">
              {s?.logo_subtext || "Profesyonel üretim ve tasarım çözümleri."}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100 shadow-sm">
            <span className="text-slate-900 font-black text-2xl">{products?.length || 0}</span>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none">Benzersiz<br/>Ürün</span>
          </div>
        </header>

        {/* Ürün Grid Yapısı */}
        {!products?.length ? (
          <div className="py-40 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
            <div className="text-slate-200 text-9xl font-black italic mb-4 opacity-50">BOŞ</div>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Katalog şu an güncelleniyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {products.map((product, index) => (
              <div key={product.id} className="group flex flex-col">
                <Link 
                  href={`/products/${product.slug}`} 
                  className="relative aspect-square bg-slate-50 rounded-[3.5rem] overflow-hidden border border-slate-100 mb-8 transition-all duration-700 group-hover:shadow-[0_50px_100px_-20px_rgba(37,99,235,0.15)] group-hover:-translate-y-3"
                >
                  {product.image || s?.og_image_default ? (
                    <Image 
                      src={product.image || s?.og_image_default || "/placeholder.jpg"} 
                      alt={product.name}
                      fill
                      priority={index < 3} // İlk 3 ürünü öncelikli yükle (LCP için)
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-100 font-black text-8xl italic">
                      {brandName[0]}
                    </div>
                  )}
                  
                  <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-white z-20">
                    <span className="text-slate-900 font-black text-lg tracking-tighter">
                      {new Intl.NumberFormat('tr-TR').format(product.price)} <span className="text-blue-600 text-xs italic">₺</span>
                    </span>
                  </div>
                </Link>

                <div className="px-4 flex-1 flex flex-col">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4 group-hover:text-blue-600 transition-colors uppercase leading-tight">
                    {product.name}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium italic opacity-70">
                    {product.description || "Teknik detaylar için ürünü inceleyin."}
                  </p>
                  
                  <div className="mt-auto flex gap-3">
                    <Link 
                      href={`/products/${product.slug}`} 
                      className="flex-[4] bg-slate-900 text-white text-center py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      DETAYLARI GÖR
                    </Link>
                    <Link 
                      href={`https://wa.me/${s?.whatsapp_no}?text=${encodeURIComponent(`Merhaba, "${product.name}" ürünü hakkında bilgi alabilir miyim?`)}`}
                      target="_blank"
                      className="flex-1 bg-slate-50 text-slate-400 flex items-center justify-center rounded-2xl border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
                    >
                      <span className="text-xl">✉</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="mt-40 max-w-7xl mx-auto px-4 md:px-0">
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.4em] mb-6 block">KATALOG DIŞI ÜRETİM</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase italic leading-[0.85]">
              Özel Bir <br/> Projen mi Var?
            </h2>
            <Link 
              href={`https://wa.me/${s?.whatsapp_no}?text=Merhaba, özel bir projem için 3D baskı teklifi almak istiyorum.`} 
              target="_blank" 
              className="inline-block bg-blue-600 text-white px-14 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-slate-900 transition-all shadow-2xl active:scale-95"
            >
              DOSYANI GÖNDER & TEKLİF AL
            </Link>
          </div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-[100px]" />
        </div>
      </section>
    </div>
  );
}