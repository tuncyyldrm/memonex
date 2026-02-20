import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"], // Admin ve API panelini gizle
    },
    sitemap: "https://memonex3d.com/sitemap.xml",
  };
}