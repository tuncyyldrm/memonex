// app/not-found.tsx
'use client'; 

import Link from 'next/link';

export default function NotFound() {
  // NOT: Burada <html> veya <body> etiketi KULLANMIYORUZ.
  // Çünkü bu sayfa RootLayout içindeki {children} kısmına basılacak.
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6 animate-bounce">🛸</div>
      
      <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-600 mb-8">
        Memonex3D Evreninde Yolunu Mu Kaybettin?
      </h2>
      
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Ana Sayfaya Dön
        </Link>
        <button
          onClick={() => window.history.back()}
          className="px-8 py-3 border border-slate-200 text-slate-600 rounded-full font-bold hover:bg-slate-50 transition-all"
        >
          Geri Git
        </button>
      </div>
    </div>
  );
}