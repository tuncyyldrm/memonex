import Navbar from "@/components/Navbar";
import Link from "next/link";
import Script from "next/script";
import { Suspense } from "react"; 
import GoogleAnalyticsTracker from "@/components/GoogleAnalyticsTracker"; 
import { GA_TRACKING_ID } from "@/lib/gtag";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

// 1. MERKEZİ METADATA YÖNETİMİ
export async function generateMetadata(): Promise<Metadata> {
  const { data: s } = await supabase.from("site_settings").select("*").single();
  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const fullBrand = `${brandName} ${brandSuffix}`;
  const siteUrl = s?.site_url || "https://memonex3d.com";
  const description = s?.site_description_default || "Yüksek hassasiyetli 3D baskı çözümleri.";

  return {
    title: {
      default: fullBrand,
      template: s?.site_title_template || `%s | ${fullBrand}`,
    },
    description: description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: "/", // KRİTİK 1: siteUrl yerine "/" yazmak daha güvenlidir.
    },
    openGraph: {
      title: fullBrand,
      description: description,
      url: "./",
      siteName: fullBrand,
      images: [{ 
        url: s?.og_image_default || "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: fullBrand 
      }],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullBrand,
      description: description,
      images: [s?.og_image_default || "/og-default.jpg"],
    },
    robots: {
      index: s?.allow_ai_bots ?? true,
      follow: s?.allow_ai_bots ?? true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    other: {
      "geo.position": `${s?.geo_latitude};${s?.geo_longitude}`,
      "ICBM": `${s?.geo_latitude}, ${s?.geo_longitude}`,
      "geo.placename": "Isparta", // KRİTİK 2: Split hatasını önlemek için sabitledik.
      "geo.region": "TR-32", // KRİTİK 3: Isparta için tam bölge kodu.
      "theme-color": s?.accent_color_hex || "#2563eb",
    }
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { data: s } = await supabase.from("site_settings").select("*").single();

  const activeGAId = s?.ga_tracking_id || GA_TRACKING_ID;
  const brandName = s?.brand_name || "MEMONEX";
  const brandSuffix = s?.brand_suffix || "3D";
  const fullBrand = `${brandName} ${brandSuffix}`;

  const navLinks = [
    { name: "Katalog", href: "/products" },
    { name: "Satış & Mağaza", href: "/satis-ve-magaza" },
    { name: "Blog", href: "/blog" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "İletişim", href: "/iletisim" },
  ];

  return (
    <> 
      {/* DİKKAT: Burada <html> ve <body> etiketlerini kaldırdık. 
          Çünkü bu etiketler zaten üst dosya olan app/layout.tsx içinde var.
          Buraya sadece içerik ve scriptler gelir.
      */}

      {/* Google Analytics Scriptleri */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${activeGAId}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${activeGAId}');
          `,
        }}
      />

      <Suspense fallback={null}>
        <GoogleAnalyticsTracker trackingId={activeGAId} />
      </Suspense>

      <div className="flex flex-col min-h-screen selection:bg-blue-600 selection:text-white">
        <Navbar settings={s} />
        
        <main id="main-content" className="flex-grow bg-[#FCFCFD] pt-20">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              
              {/* Marka ve Slogan Alanı */}
              <div className="col-span-1 md:col-span-2 space-y-8">
                <Link href="/" className="font-black text-2xl tracking-tighter uppercase inline-block">
                  {brandName}<span className="text-blue-600 italic">{brandSuffix}</span>
                </Link>
                <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed italic">
                  &quot;{s?.brand_slogan || "Fikirlerinizi milimetrik hassasiyetle somut gerçekliğe dönüştüren yeni nesil üretim merkezi."}&quot;
                </p>
                {s?.logo_subtext && (
                  <span className="block text-[10px] text-slate-300 uppercase tracking-widest">{s.logo_subtext}</span>
                )}
              </div>
              
              {/* Navigasyon */}
              <nav className="space-y-8" aria-label="Footer Navigasyon">
                <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900">Navigasyon</h4>
                <ul className="space-y-5">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-slate-400 text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Atölye ve İletişim Bilgileri */}
              <div className="space-y-8">
                <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900">Atölye</h4>
                <address className="not-italic text-slate-500 text-xs font-bold leading-loose uppercase tracking-tighter">
                  {s?.workshop_address || "Isparta, Türkiye"}<br/>
                  <a href={`mailto:${s?.contact_email}`} className="text-blue-600 lowercase font-medium italic underline underline-offset-4 hover:text-slate-900 transition-colors">
                    {s?.contact_email}
                  </a>
                  {s?.whatsapp_no && (
                    <div className="mt-4">
                      <a 
                        href={`https://wa.me/${s.whatsapp_no}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-green-600 transition-colors flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        WA: {s.whatsapp_no}
                      </a>
                    </div>
                  )}
                </address>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                © {new Date().getFullYear()} {fullBrand}. Gelecek Burada Basılıyor.
              </p>
              <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {s?.instagram_url && (
                  <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Instagram</a>
                )}
                {s?.tiktok_url && (
                  <a href={s.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Tiktok</a>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}