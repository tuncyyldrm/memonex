import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",      // Admin paneli
          "/api",        // API rotaları
          "/private",    // Varsa özel klasörler
          "/*?*",        // Filtreleme yapıyorsan (query string) taramayı engeller
        ],
      },
      {
        userAgent: "GPTBot", // ChatGPT botu için özel kural (İstersen kapatabilirsin)
        disallow: ["/"], 
      }
    ],
    sitemap: "https://memonex3d.com/sitemap.xml",
  };
}