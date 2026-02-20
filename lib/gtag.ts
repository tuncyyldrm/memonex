export const GA_TRACKING_ID = 'G-CW05QPYXS3';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Kütüphane tanımlarıyla çakışmaması için en esnek tanım:
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any; // 'any' kullanarak kütüphane içindeki katı kuralları bypass ediyoruz
  }
}