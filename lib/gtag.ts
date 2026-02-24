// lib/gtag.ts
export const GA_TRACKING_ID = 'G-CW05QPYXS3'; // Yedek (Fallback)

// dynamicId gelirse onu kullan, gelmezse statik olanı kullan
export const pageview = (url: string, dynamicId?: string) => {
  const activeId = dynamicId || GA_TRACKING_ID;
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', activeId, {
      page_path: url,
    });
  }
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer?: Object[]; 
  }
}