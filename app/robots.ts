import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://memonex3d.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",      // Admin girişi
          "/dashboard",  // Varsa kullanıcı paneli
          "/api/",       // API endpointleri (Trailing slash önemli)
          "/private/",   // Gizli dosyalar
          "/*?*",        // Parametreli URL'ler (Yinelenen içerik riskini azaltır)
          "/_next/",     // Next.js iç dosyaları (Genelde otomatik engellenir ama garanti olur)
        ],
      },
      {
        // Yapay zeka botlarını genel olarak engellemek istersen (isteğe bağlı)
        userAgent: ["GPTBot", "CCBot", "Google-Extended"],
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}