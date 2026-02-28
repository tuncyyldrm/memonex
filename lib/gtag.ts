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
    // window.gtag varsa onu kullan, yoksa dataLayer'a push et
    if (typeof window.gtag === 'function') {
      window.gtag('config', activeId, {
        page_path: url,
        debug_mode: true,
      });
} else {
      // Kuyruğa itme (Pushing to queue)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push('js', new Date()); // Bazı tarayıcılar için başlatma sinyali
      window.dataLayer.push('config', activeId, { 
        page_path: url, 
        debug_mode: true 
      });
    }
  }
};