// app/layout.tsx
import "./globals.css"; // CSS BURADA OLMALI

import CoreStatusMonitor from '@/components/CoreStatusMonitor'; // 1. Bileşeni içe aktar
import CookieBanner from '@/components/CookieBanner'; // 2. Bileşeni içe aktar

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}     
        <CoreStatusMonitor />
        <CookieBanner />
      </body>
    </html>
  );
}