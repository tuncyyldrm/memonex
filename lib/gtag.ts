// lib/gtag.ts

export const GA_TRACKING_ID = 'G-CW05QPYXS3';

declare global {
  interface Window {
    gtag: (...args: any[]) => void; // Daha esnek bir tanım
    dataLayer: any[];
  }
}

export const pageview = (url: string, dynamicId?: string) => {
  const activeId = dynamicId || GA_TRACKING_ID;
  
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag('config', activeId, {
        page_path: url,
      });
    } else {
      // gtag henüz hazır değilse kuyruğa standart GA4 formatında ekle
      window.dataLayer = window.dataLayer || [];
      // 'js' ve 'config' emirlerini push ederken dizi formatı (arguments) kullanılır
      window.dataLayer.push(['js', new Date()]);
      window.dataLayer.push(['config', activeId, { page_path: url }]);
    }
  }
};