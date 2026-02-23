import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

// Sitemap'i her 12 saatte bir yeniden oluşturmak performansı artırır (Vercel/Next.js dostu)
export const revalidate = 43200; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://memonex3d.com";

  // Tüm verileri paralel çekerek hızı artırıyoruz
  const [productsRes, postsRes, pagesRes] = await Promise.all([
    supabase.from("products").select("slug, created_at"),
    supabase.from("blog_posts").select("slug, created_at").eq("published", true),
    supabase.from("pages").select("slug, created_at") // Kurumsal sayfaları da ekledik
  ]);

  const products = productsRes.data || [];
  const posts = postsRes.data || [];
  const pages = pagesRes.data || [];

  // 1. Statik Ana Rotalar
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. Ürün Rotaları
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Blog Yazıları
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 4. Kurumsal/Dinamik Sayfalar (Hakkımızda, KVKK vs.)
  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${baseUrl}/${p.slug}`, // Bunlar kök dizinde olduğu için direkt /slug
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.4, // Yasal sayfaların önceliği genellikle daha düşüktür
  }));

  return [...staticPages, ...productEntries, ...blogEntries, ...pageEntries];
}