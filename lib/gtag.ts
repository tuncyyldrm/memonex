export const GA_TRACKING_ID = 'G-CW05QPYXS3';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    // Hata veren satırı şununla değiştir:
    dataLayer?: Object[]; 
  }
}