import "../globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Script from "next/script"; // Gerekli: Script bileşeni
import { Suspense } from "react"; 
import GoogleAnalyticsTracker from "@/components/GoogleAnalyticsTracker"; 
import { GA_TRACKING_ID } from "@/lib/gtag";

export const metadata = {
  title: {
    default: "Memonex 3D | Yeni Nesil Üretim Merkezi",
    template: "%s | Memonex 3D"
  },
  description: "Yüksek hassasiyetli 3D baskı, prototipleme ve özel tasarım çözümleri.",
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://memonex3d.com',
    siteName: 'Memonex 3D',
  }
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const navLinks = [
    { name: "Katalog", href: "/products" },
    { name: "Satış & Mağaza", href: "/satis-ve-magaza" },
    { name: "Blog", href: "/blog" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "İletişim", href: "/iletisim" },
  ];

  return (
    <>
      {/* 1. Google Analytics Kütüphanesini Yükle */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />

      {/* 2. Google Analytics Başlatma Yapılandırması */}
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* 3. Sayfa Geçişlerini Takip Eden Bileşen */}
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker />
      </Suspense>

      <div className="flex flex-col min-h-screen selection:bg-blue-600 selection:text-white">
        <Navbar />
        
        <main id="main-content" className="flex-grow bg-[#FCFCFD] pt-20">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              
              <div className="col-span-1 md:col-span-2 space-y-8">
                <Link href="/" className="font-black text-2xl tracking-tighter uppercase inline-block">
                  MEMONEX<span className="text-blue-600 italic">3D</span>
                </Link>
                <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed italic">
                  &quot;Fikirlerinizi milimetrik hassasiyetle somut gerçekliğe dönüştüren yeni nesil üretim merkezi.&quot;
                </p>
              </div>
              
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

              <div className="space-y-8">
                <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900">Atölye</h4>
                <address className="not-italic text-slate-500 text-xs font-bold leading-loose uppercase tracking-tighter">
                  Isparta, Türkiye<br/>
                  <a href="mailto:tuncyyldrm@gmail.com" className="text-blue-600 lowercase font-medium italic underline underline-offset-4 hover:text-slate-900 transition-colors">
                    tuncyyldrm@gmail.com
                  </a>
                </address>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                © 2026 Memonex3D. Gelecek Burada Basılıyor.
              </p>
              <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <a href="https://instagram.com/memonex3d" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Instagram</a>
                <a href="https://tiktok.com/@memonex3d" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Tiktok</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}