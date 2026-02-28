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
    if (typeof window.gtag === 'function') {
      window.gtag('config', activeId, {
        page_path: url,
        // Mobilde izlemeyi zorlamak için debug modunu açabilirsin
        debug_mode: true 
      });
    } else {
      window.dataLayer = window.dataLayer || [];
      // KRİTİK DÜZELTME: push içine doğrudan dizi değil, 'arguments' benzeri yapı gönderilmelidir
      // Bazı tarayıcılar ['config', ...] yapısını anlamayabilir, gtag fonksiyonunun yaptığı işi simüle edelim:
      function gtagPush() { window.dataLayer.push(arguments); }
      
      // @ts-ignore
      gtagPush('js', new Date());
      // @ts-ignore
      gtagPush('config', activeId, { page_path: url });
    }
  }
};