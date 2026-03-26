import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Calculator from "@/components/Calculator";

// 1. DİNAMİK METADATA
export async function generateMetadata(): Promise<Metadata> {
  const { data: s } = await supabase.from("site_settings").select("*").single();
  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;
  
  const title = `3D Baskı Fiyat Hesaplama & Hızlı Teklif | ${brand}`;
  const description = `${brand} online 3D baskı hesaplama aracı ile STL dosyalarınızı yükleyin, anında fiyat alın. Isparta 3D yazıcı hizmeti için hızlı üretim teklifi oluşturun.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${s?.site_url}/hizli-teklif`,
      images: [{ url: s?.og_image_default || "/og-image.jpg" }],
    },
    // Sayfanın botlar tarafından taranmasına izin ver
    robots: "index, follow",
  };
}

export default async function QuickQuotePage() {
  // 2. SCHEMA.ORG (Hizmet & Yazılım Uygulaması)
  // Google'ın bu sayfanın bir "Araç" olduğunu anlamasını sağlar
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Memonex 3D Baskı Fiyat Hesaplayıcı",
    "applicationCategory": "BusinessApplication",
    "description": "3D modellerinizi yükleyerek saniyeler içinde üretim maliyeti hesaplayın.",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto px-6">
        <header className="max-w-4xl mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-12 bg-blue-600"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Online Analiz Sistemi</span>
          </div>
          
          <h1 className="text-5xl md:text-[6rem] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic mb-10">
            HIZLI <br/> <span className="text-blue-600">TEKLİF.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl italic leading-relaxed">
            Memonex <span className="text-slate-900 font-bold">Cloud-Engine</span> ile STL/OBJ modellerinizi saniyeler içinde analiz edin, Isparta atölyemizde profesyonel üretime başlayın.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Hesaplayıcı Ana Alan */}
          <div className="lg:col-span-3">
             <Calculator />
          </div>

          {/* Yan Bilgi Paneli (SEO İçin Anahtar Kelime Odaklı Metinler) */}
          <aside className="lg:col-span-1 space-y-10 border-l border-slate-100 pl-8 hidden lg:block">
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Nasıl Çalışır?</h3>
              <ul className="text-xs text-slate-500 space-y-4 font-medium italic">
                <li><b className="text-blue-600">1. Yükle:</b> 3D model dosyanızı sürükleyin.</li>
                <li><b className="text-blue-600">2. Ayarla:</b> Malzeme ve doluluk oranını seçin.</li>
                <li><b className="text-blue-600">3. Onayla:</b> Anlık fiyatı görün ve sipariş verin.</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-3xl">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Teknik Destek</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed uppercase font-bold italic">
                Dosya formatı veya üretim kapasitesi hakkında sorunuz mu var? <br/>
                <span className="text-blue-600">WhatsApp üzerinden uzmanımızla görüşün.</span>
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}