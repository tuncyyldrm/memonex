'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images = [] }: { images: string[] }) {
  // Veri temizleme
  const safeImages = images?.filter(img => img && typeof img === 'string') || [];
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (safeImages.length > 0) {
      setActiveImage(safeImages[0]);
    }
  }, [images]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* --- Ana Görsel Alanı --- */}
      <div className="group relative aspect-square bg-[#F8FAFC] rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-blue-900/5">
        
        {/* Cam Efekti Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />
        
        {activeImage ? (
          <div className="relative w-full h-full p-4">
             <Image 
              key={activeImage} // Resim değiştiğinde animasyonu tetikler
              src={activeImage} 
              alt="Memonex3D Üretim Modeli" 
              fill
              priority
              className="object-contain p-8 animate-in zoom-in-95 duration-500 transition-transform duration-[2s] group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
            <span className="text-slate-200 font-black text-[10rem] italic tracking-tighter select-none opacity-50">M3D</span>
            <div className="absolute bottom-12 px-6 py-2 bg-white/80 backdrop-blur rounded-full border border-slate-100 shadow-sm">
               <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Görsel Hazırlanıyor</span>
            </div>
          </div>
        )}
      </div>
      
      {/* --- Thumbnails (Küçük Resimler) --- */}
      {safeImages.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-1">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${
                activeImage === img 
                  ? 'border-blue-600 ring-4 ring-blue-50 scale-95' 
                  : 'border-transparent bg-slate-50 opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image src={img} alt={`Küçük resim ${idx}`} fill className="object-cover p-2" />
            </button>
          ))}
        </div>
      )}

      {/* --- Teknik Rozetler --- */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { icon: "∞", label: "Mukavemet", desc: "Endüstriyel", color: "text-blue-600" },
          { icon: "0.05", label: "Hassasiyet", desc: "Katman/mm", color: "text-slate-900" },
          { icon: "PRO", label: "Materyal", desc: "Premium", color: "text-blue-600" }
        ].map((item, i) => (
          <div key={i} className="group/item bg-white p-6 rounded-[2.5rem] text-center border border-slate-100 shadow-sm hover:border-blue-200 transition-all duration-300">
            <div className={`${item.color} font-black text-2xl mb-2 group-hover/item:scale-110 transition-transform`}>{item.icon}</div>
            <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5 opacity-60">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}