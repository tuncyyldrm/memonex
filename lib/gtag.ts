// lib/gtag.ts

export const GA_TRACKING_ID = 'G-CW05QPYXS3';

// TypeScript'in window objesini tanıması için global tanım
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const pageview = (url: string, dynamicId?: string) => {
  const activeId = dynamicId || GA_TRACKING_ID;
  
  if (typeof window !== 'undefined') {
    // Eğer gtag kütüphanesi hazırsa doğrudan gönder
    if (typeof window.gtag === 'function') {
      window.gtag('config', activeId, {
        page_path: url,
        debug_mode: true, // Mobilde anlık izlemek için aktif
      });
    } else {
      // Kütüphane henüz yüklenmemişse (Mobilde yavaş açılış) dataLayer kuyruğuna at
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['config', activeId, { 
        page_path: url,
        debug_mode: true 
      }]);
    }
  }
};