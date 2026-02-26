//app\(site)\not-found.tsx
import Link from 'next/link';
import { Metadata } from 'next';

// 1. Title Önceliği: Layout'taki template ile birleşerek 
// "404 Bulunamadı | MEMONEX 3D" sonucunu üretir.
export const metadata: Metadata = {
  title: "404 Bulunamadı",
  description: "Aradığınız sayfa Memonex3D evreninde bulunamadı.",
};

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 bg-[#FCFCFD]">
      {/* İkon / Görsel Alanı */}
      <div className="relative mb-10">
        <div className="text-[120px] leading-none animate-pulse select-none">🛸</div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-3 bg-slate-200/50 rounded-[100%] blur-md"></div>
      </div>
      
      {/* Metin İçeriği */}
      <div className="space-y-4 mb-12">
        <h1 className="text-8xl md:text-9xl font-black text-slate-900 tracking-tighter italic">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-bold text-slate-600 uppercase tracking-tight">
          Yolunu Mu Kaybettin?
        </h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed italic">
          &quot;Aradığınız koordinatlara ulaşılamıyor. Belki de bu parça henüz tasarlanmamıştır.&quot;
        </p>
      </div>
      
      {/* Aksiyon Butonları */}
      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md justify-center px-6">
        <Link
          href="/"
          className="px-10 py-4 bg-blue-600 text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-slate-900 transition-all active:scale-95"
        >
          Ana Sayfaya Dön
        </Link>
        
        {/* 'Geri Git' butonu yerine daha stabil olan 'İletişim' veya 'Katalog' önerilir */}
        <Link
          href="/iletisim"
          className="px-10 py-4 border border-slate-200 text-slate-500 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all active:scale-95"
        >
          Yardım Al
        </Link>
      </div>

      {/* Arka Plan Dekorasyonu (Minimal) */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
}