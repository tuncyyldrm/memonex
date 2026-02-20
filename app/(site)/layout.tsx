import "../globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata = {
  title: "Memonex 3D | Yeni Nesil Üretim Merkezi",
  description: "Yüksek hassasiyetli 3D baskı, prototipleme ve özel tasarım çözümleri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navigasyon linkleri
  const navLinks = [
    { name: "Katalog", href: "/products" },
    { name: "Satış & Mağaza", href: "/satis-ve-magaza" },
    { name: "Blog", href: "/blog" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "İletişim", href: "/iletisim" },
  ];

  return (
    <html lang="tr">
      <body className="antialiased">
        <div className="flex flex-col min-h-screen selection:bg-blue-600 selection:text-white">
          <Navbar />
          
          <main className="flex-grow bg-[#FCFCFD] pt-20">
            {children}
          </main>

          {/* --- FOOTER --- */}
          <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                <div className="col-span-1 md:col-span-2 space-y-8">
                  <span className="font-black text-2xl tracking-tighter uppercase block">
                    MEMONEX<span className="text-blue-600 italic">3D</span>
                  </span>
                  <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed italic">
                    "Fikirlerinizi milimetrik hassasiyetle somut gerçekliğe dönüştüren yeni nesil üretim merkezi."
                  </p>
                </div>
                
                <div className="space-y-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900">Navigasyon</h4>
                  <ul className="space-y-5">
                    {navLinks.map((link) => (
                      <li key={link.name}>
                        <Link href={link.href} className="text-slate-400 text-xs font-bold hover:text-blue-600 transition-colors uppercase tracking-widest">
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-8">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-900">Atölye</h4>
                  <p className="text-slate-500 text-xs font-bold leading-loose uppercase tracking-tighter">
                    Isparta, Türkiye<br/>
                    <span className="text-blue-600 lowercase font-medium italic">tuncyyldrm@gmail.com</span>
                  </p>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                  © 2026 Memonex3D. Gelecek Burada Basılıyor.
                </p>
                <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <a href="https://instagram.com/memonex3d" target="_blank" className="hover:text-blue-600 transition-colors">Instagram</a>
                  <a href="https://tiktok.com/@memonex3d" target="_blank" className="hover:text-blue-600 transition-colors">Tiktok</a>
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* Google Analytics - Body kapanmadan hemen önce */}
        <GoogleAnalytics gaId="G-CW05QPYXS3" />
      </body>
    </html>
  );
}