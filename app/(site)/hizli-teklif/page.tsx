import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Calculator from "@/components/Calculator";

export async function generateMetadata(): Promise<Metadata> {
  const { data: s } = await supabase.from("site_settings").select("*").single();
  const brand = `${s?.brand_name || "Memonex"} ${s?.brand_suffix || "3D"}`;
  
  const title = `3D Baskı Fiyat Hesaplama & STL Analiz | ${brand}`;
  const description = `${brand} online fiyat hesaplama aracı. STL dosyalarınızı yükleyin, gramaj ve süre bazlı anında teklif alın. Isparta profesyonel 3D yazıcı hizmetleri.`;

  return {
    title,
    description,
    keywords: ["3d baskı fiyat hesaplama", "stl fiyat al", "3d yazıcı maliyet hesaplama", "ısparta 3d baskı", "online stl analiz"],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${s?.site_url}/hizli-teklif`,
      images: [{ url: s?.og_image_default || "/og-image.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function QuickQuotePage() {
  const { data: s } = await supabase.from("site_settings").select("*").single();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "3D baskı fiyatı nasıl hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Fiyatlandırma; modelin hacmi (gramaj), baskı süresi, seçilen malzeme türü ve doluluk oranına göre sistemimiz tarafından otomatik hesaplanır."
        }
      },
      {
        "@type": "Question",
        "name": "Hangi dosya formatlarını yükleyebilirim?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sistemimiz şu an için .STL uzantılı dosyaları desteklemektedir."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER (BİRİNCİ SATIR) --- */}
        <header className="max-w-4xl mb-4">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-[1px] w-12 bg-blue-600"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">Endüstriyel Üretim Hattı</span>
          </div>
          
          <h1 className="text-5xl md:text-[6rem] font-black text-slate-900 tracking-tighter leading-[0.85] uppercase italic mb-10">
            HIZLI <br/> <span className="text-blue-600">TEKLİF.</span>
          </h1>
          
          <p className="text-xl text-slate-500 font-medium max-w-2xl italic leading-relaxed">
            Isparta&apos;nın en gelişmiş <span className="text-slate-900 font-bold">3D baskı motoru</span> ile maliyetlerinizi optimize edin. Dosyanızı yükleyin, teknik parametreleri seçin ve saniyeler içinde teklif alın.
          </p>
        </header>

        {/* --- CALCULATOR AREA (İKİNCİ SATIR - TAM GENİŞLİK) --- */}
        <main className="w-full mb-20">
           <Calculator />
        </main>

        {/* --- ÜRETİM PARAMETRELERİ & KURUMSAL (ÜÇÜNCÜ SATIR - ALT ALTA) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-28 border-t border-slate-100 pt-16">
          <div className="bg-slate-50 p-10 rounded-[2.5rem]">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-200 pb-4 inline-block">
              Üretim Parametreleri
            </h3>
            <ul className="text-sm text-slate-500 space-y-4 font-medium italic leading-loose">
              <li><b className="text-slate-900">Malzeme:</b> PLA, PETG, ABS, TPU seçenekleri.</li>
              <li><b className="text-slate-900">Hassasiyet:</b> 0.1mm - 0.28mm katman yüksekliği.</li>
              <li><b className="text-slate-900">Teslimat:</b> Türkiye geneli kargo</li>
              <li><b className="text-slate-900">Cihaz Parkuru:</b> Anycubic Kobra 2 Plus & S1 Combo teknolojisi.</li>
            </ul>
          </div>
          
          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-80">Kurumsal Çözümler</h3>
              <p className="text-lg leading-relaxed font-bold mb-8 italic">
                Seri üretim ve prototipleme projeleriniz için <br className="hidden md:block"/> size özel ticari teklif hazırlayalım.
              </p>
              <a 
                href={`https://wa.me/${s?.whatsapp_no}`} 
                target="_blank"
                className="text-[11px] font-black uppercase bg-white text-blue-600 px-10 py-4 rounded-2xl inline-block hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 shadow-lg"
              >
                WHATSAPP DESTEK HATTI
              </a>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </div>
        </div>

        {/* --- SEO BİLGİ ALANI (DÖRDÜNCÜ SATIR) --- */}
        <section className="border-t border-slate-100 pt-20 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-none">
              Neden Online <br /> <span className="text-blue-600 text-[0.8em]">Fiyatlandırma?</span>
            </h2>
            <div className="prose prose-slate prose-sm font-medium text-slate-500 italic leading-7">
              <p>
                Geleneksel teklif süreçleri günler sürebilir. Memonex 3D olarak geliştirdiğimiz algoritma, 3D modelinizin geometrisini analiz ederek kullanılacak filament miktarını ve baskı süresini hesaplar. 
                <strong> Isparta 3D baskı</strong> merkezimizde, FDM teknolojisi ile yüksek mukavemetli parçalar üretiyoruz.
              </p>
            </div>
          </div>

          <div className="space-y-6">
             <div className="group border-b border-slate-100 pb-6">
                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Hangi Dosya Formatları?</h4>
                <p className="text-xs text-slate-500 italic">Sistemimiz .STL dosyalarını otomatik analiz eder.</p>
             </div>
             <div className="group border-b border-slate-100 pb-6">
                <h4 className="text-sm font-black text-slate-900 uppercase mb-2">Maksimum Baskı Alanı?</h4>
                <p className="text-xs text-slate-500 italic">Tek parça halinde 320x320x400mm ölçülerine kadar üretim yapabiliyoruz.</p>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}