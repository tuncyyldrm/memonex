import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

// Canlı veri çekimini zorunlu kılıyoruz
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://memonex3d.com";

  let products: any[] = [];
  let posts: any[] = [];

  try {
    // Tablo yapına göre sütun isimlerini güncelledik (updated_at yerine created_at)
    const [productsRes, postsRes] = await Promise.all([
      supabase.from("products").select("slug, created_at"),
      supabase.from("blog_posts").select("slug, created_at").eq("published", true)
    ]);

    products = productsRes.data || [];
    posts = postsRes.data || [];
  } catch (error) {
    console.error("Veri çekilirken hata oluştu:", error);
  }

  // 1. Statik Rotalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Ürünler (Tablondaki slug sütununu kullanır)
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Bloglar
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...productEntries, ...blogEntries];
}