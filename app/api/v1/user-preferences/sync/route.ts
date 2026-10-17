//app\api\v1\user-preferences\sync\route.ts

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const GA_API_SECRET = process.env.GA_API_SECRET;

let cachedGaId: string | null = null;
let lastFetchTime = 0;
const GA_CACHE_TTL = 1000 * 60 * 60; // 1 saat önbellek

async function getMeasurementId(): Promise<string | null> {
  const now = Date.now();
  if (cachedGaId && now - lastFetchTime < GA_CACHE_TTL) {
    return cachedGaId;
  }
  try {
    const { data: settings } = await supabase
      .from('site_settings')
      .select('ga_tracking_id')
      .single();

    if (settings?.ga_tracking_id) {
      cachedGaId = settings.ga_tracking_id;
      lastFetchTime = now;
    }
  } catch (err) {
    console.error('GA settings lookup error:', err);
  }
  return cachedGaId;
}

export async function POST(request: Request) {
  try {
    const measurementId = await getMeasurementId();
    if (!measurementId) {
      console.error('GA measurement ID is not configured.');
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    if (!GA_API_SECRET) {
      console.error('GA_API_SECRET is not configured for this deployment.');
      return NextResponse.json({ status: 'error' }, { status: 500 });
    }

    const body = await request.json();
    const { eventName, contextId, viewLabel, uid, sid, screenResolution, language, referrer, ...restParams } = body;

    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim();

    // 1. Temiz Sayfa Yolu (Path) Ayıklama Mekanizması
    let pagePath = '/';
    const campaignParams: Record<string, string> = {};

    try {
      const urlObj = new URL(contextId);
      pagePath = urlObj.pathname + urlObj.search;

      // 2. GA4 Measurement Protocol Resmi Kampanya Parametreleri
      const utmSource = urlObj.searchParams.get('utm_source');
      const utmMedium = urlObj.searchParams.get('utm_medium');
      const utmCampaign = urlObj.searchParams.get('utm_campaign');
      
      if (utmSource) campaignParams['source'] = utmSource;
      if (utmMedium) campaignParams['medium'] = utmMedium;
      if (utmCampaign) campaignParams['campaign'] = utmCampaign;
    } catch {
      pagePath = contextId; // URL parse edilemezse fallback
    }

    const googlePayload = {
      client_id: uid,
      events: [
        {
          name: eventName,
          params: {
            page_location: contextId,
            page_path: pagePath,
            page_title: viewLabel,
            page_referrer: referrer === '$direct' ? '' : referrer,
            ga_session_id: sid,
            engagement_time_msec: 100,
            custom_language: language,
            screen_resolution: screenResolution,
            ...campaignParams,  // Düzeltilmiş trafik kaynakları
            ...restParams       // E-ticaret veya diğer özel parametreler
          },
        },
      ],
    };

    // Google Analytics API İsteği
    const gaResponse = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(GA_API_SECRET)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify(googlePayload),
      }
    );

    if (!gaResponse.ok) {
      console.error('GA Measurement Protocol Error:', gaResponse.status, await gaResponse.text());
      return NextResponse.json({ status: 'error' }, { status: 502 });
    }

    return NextResponse.json({ status: 'synced' }, { status: 200 });
  } catch (error) {
    console.error('GA Sync Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}