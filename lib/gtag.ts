// lib/gtag.ts

export const GA_TRACKING_ID = 'G-CW05QPYXS3';

// TypeScript'e window objesi içinde bu özelliklerin olduğunu öğretiyoruz
declare global {
  interface Window {
    gtag: (command: string, id: string, config?: any) => void;
    dataLayer: any[];
  }
}

export const pageview = (url: string, dynamicId?: string) => {
  const activeId = dynamicId || GA_TRACKING_ID;
  
  if (typeof window !== 'undefined') {
    // Eğer gtag fonksiyonu yüklendiyse doğrudan çağır
    if (typeof window.gtag === 'function') {
      window.gtag('config', activeId, {
        page_path: url,
      });
    } 
    // Gtag henüz yoksa (özellikle yavaş mobil bağlantılarda) veriyi kuyruğa at v3
    else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageview',
        page_path: url,
        send_to: activeId
      });
    }
  }
};