'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryProps {
  images: string[];
  productName?: string; 
}

export default function ProductGallery({ images = [], productName = "3D Baskı Parçası" }: GalleryProps) {
  const safeImages = images?.filter(img => img && typeof img === 'string') || [];
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const activeImage = (selectedImage && safeImages.includes(selectedImage)) ? selectedImage : (safeImages[0] || '');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* --- Ana Görsel Alanı --- */}
<div className="group relative aspect-square bg-[#F8FAFC] rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)]">
  
  {activeImage ? (
    <div className="relative w-full h-full transition-all duration-500 ease-in-out">
      <Image 
        key={activeImage} 
        src={activeImage} 
        alt={`${productName} - Memonex3D Hassas Üretim`} 
        fill
        priority 
        /* object-cover: Görseli kare alana yayar ve boşluk bırakmaz */
        /* p-0: Padding'i sıfırlayarak görselin kenarlara yaslanmasını sağlar */
        className="object-cover p-0 transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <span className="text-slate-200 font-black text-6xl italic tracking-tighter opacity-50">M3D</span>
    </div>
  )}
</div>
      
      {/* --- Thumbnails --- */}
      {safeImages.length > 1 && (
        <div 
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 scroll-smooth"
          role="list"
        >
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              role="listitem"
              aria-label={`${productName} görseli ${idx + 1}`}
              aria-current={activeImage === img}
              onClick={() => setSelectedImage(img)}
              className={`relative w-24 h-24 flex-shrink-0 rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${
                activeImage === img 
                  ? 'border-blue-600 ring-4 ring-blue-50 scale-95' 
                  : 'border-transparent bg-slate-50 opacity-60 hover:opacity-100'
              }`}
            >
              <Image 
                src={img} 
                alt={`${productName} thumbnail ${idx + 1}`} 
                fill 
                className="object-cover" 
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* --- Teknik Rozetler --- */}
      <div className="grid grid-cols-3 gap-5">

      </div>
    </div>
  );
}