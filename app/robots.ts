import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Veritabanından ayarları çekiyoruz
  const { data: s } = await supabase.from("site_settings").select("*").single();
  
  const baseUrl = s?.site_url || "https://memonex3d.com";
  const allowAi = s?.allow_ai_bots ?? true;

  // Genel kurallar
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",      // Admin paneli
        "/dashboard",  // Kullanıcı paneli
        "/api/",       // Backend endpointleri
        "/private/",   // Gizli dosyalar
        "/*?*",        // Filtreleme/Arama parametreleri (SEO dostu)
      ],
    }
  ];

  // Eğer veritabanından AI botları kapatıldıysa kurallara ekle
  if (!allowAi) {
    rules.push({
      userAgent: ["GPTBot", "CCBot", "Google-Extended", "anthropic-ai", "Claude-Web"],
      disallow: ["/"],
    });
  }

  return {
    rules: rules,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}