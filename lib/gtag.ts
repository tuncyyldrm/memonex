// lib/gtag.ts
export const GA_TRACKING_ID = 'G-CW05QPYXS3';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const pageview = (url: string, dynamicId?: string) => {
  const activeId = dynamicId || GA_TRACKING_ID;
  if (typeof window !== 'undefined') {
    // gtag tanımlıysa kullan, değilse kuyruğa (dataLayer) ekle
    const gtagFn = window.gtag || function() { (window.dataLayer = window.dataLayer || []).push(arguments); };
    
    gtagFn('config', activeId, {
      page_path: url,
      debug_mode: true, // Paneli anlık izlemek için
    });
  }
};