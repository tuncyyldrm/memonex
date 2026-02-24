import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

// Sitemap'i her 12 saatte bir cache'den yenile
export const revalidate = 43200; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Site ayarlarından URL'i dinamik alıyoruz
  const { data: s } = await supabase.from("site_settings").select("site_url").single();
  const baseUrl = s?.site_url || "https://memonex3d.com";

  // Verileri paralel çekerek hızı artırıyoruz
  const [productsRes, postsRes, pagesRes] = await Promise.all([
    supabase.from("products").select("slug, created_at"),
    supabase.from("blog_posts").select("slug, created_at").eq("published", true),
    supabase.from("pages").select("slug, created_at")
  ]);

  const products = productsRes.data || [];
  const posts = postsRes.data || [];
  const pages = pagesRes.data || [];

  // 1. STATİK ANA ROTALAR
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/iletisim`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // 2. ÜRÜN ROTALARI (Katalog Önemlidir)
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. BLOG YAZILARI
  const blogEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  // 4. KURUMSAL SAYFALAR (Hakkımızda, Gizlilik vb.)
  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${baseUrl}/${p.slug}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticPages, ...productEntries, ...blogEntries, ...pageEntries];
}