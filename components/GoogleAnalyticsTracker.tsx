// components/GoogleAnalyticsTracker.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from '@/lib/gtag';

export default function GoogleAnalyticsTracker({ trackingId }: { trackingId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      // Veritabanından gelen veya yedek olan ID ile tetikle
      pageview(url, trackingId); 
    }
  }, [pathname, searchParams, trackingId]);

  return null;
}