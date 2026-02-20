import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://memonex3d.com";

  // Tüm ürünleri çek
  const { data: products } = await supabase.from("products").select("slug, updated_at");
  // Tüm blog yazılarını çek
  const { data: posts } = await supabase.from("blog_posts").select("slug, created_at");

  const productEntries = (products || []).map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updated_at,
  }));

  const blogEntries = (posts || []).map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.created_at,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/blog`, lastModified: new Date() },
    ...productEntries,
    ...blogEntries,
  ];
}