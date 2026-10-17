"use server";

// 1. ÖNEMLİ: Yeni asenkron client'ı çağırıyoruz
import { createClient } from "@/lib/supabase-server"; 
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  // 2. Client'ı asenkron olarak oluştur (AWAIT ŞART)
  const supabase = await createClient(); 

  const rawData = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | null>;
  
  // 3D Baskı Fiyatlandırma Motoru ve Teslimat Notu Paketleme
  const hourlyRate = Number(rawData.pricing_hourly_rate) || 110;
  const minOrderPrice = Number(rawData.pricing_min_order) || 100;
  const deliveryNote = typeof rawData.default_delivery_note === 'string'
    ? rawData.default_delivery_note
    : "* Bu model Isparta merkezli atölyemizde üretilmektedir.";

  const packedDelivery = JSON.stringify({
    hourly_rate: hourlyRate,
    min_order_price: minOrderPrice,
    delivery_note: deliveryNote
  });

  // DB'de doğrudan sütunu olmayan alanları temizliyoruz
  delete rawData.pricing_hourly_rate;
  delete rawData.pricing_min_order;

  const formattedData: Record<string, unknown> = {
    ...rawData,
    default_delivery_note: packedDelivery,
    shipping_days_min: Number(rawData.shipping_days_min) || 0,
    shipping_days_max: Number(rawData.shipping_days_max) || 0,
    handling_time_max: Number(rawData.handling_time_max) || 0,
    allow_ai_bots: rawData.allow_ai_bots === "true",
    price_valid_until: rawData.price_valid_until || null,
    ga_tracking_id: rawData.ga_tracking_id || null,
    og_image_default: rawData.og_image_default || null,
    updated_at: new Date().toISOString(),
  };

  const ALLOWED_SETTINGS_COLUMNS = new Set([
    'brand_name',
    'brand_suffix',
    'brand_slogan',
    'logo_subtext',
    'ga_tracking_id',
    'site_title_template',
    'site_description_default',
    'site_url',
    'og_image_default',
    'allow_ai_bots',
    'accent_color_hex',
    'border_radius_large',
    'border_radius_section',
    'hero_title_upper',
    'hero_title_lower',
    'price_currency',
    'price_valid_until',
    'shipping_days_min',
    'shipping_days_max',
    'handling_time_max',
    'default_delivery_note',
    'default_tech',
    'default_material',
    'default_precision',
    'whatsapp_no',
    'wa_default_msg',
    'contact_email',
    'instagram_url',
    'tiktok_url',
    'workshop_address',
    'geo_latitude',
    'geo_longitude',
    'catalog_empty_msg',
    'blog_empty_msg',
    'not_found_emoji',
    'not_found_title',
    'og_image_products',
    'og_image_blog',
    'updated_at'
  ]);

  const sanitizedData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(formattedData)) {
    if (ALLOWED_SETTINGS_COLUMNS.has(key)) {
      sanitizedData[key] = value;
    }
  }

  // 3. ID çekme işlemini de yeni asenkron supabase ile yapıyoruz
  const { data: firstRow, error: fetchError } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .single();

  if (fetchError || !firstRow) {
    return { success: false, message: "Ayar satırı bulunamadı." };
  }

  // 4. Güncelleme işlemi (Artık RLS ve kolon uyuşmazlığı hatası vermeyecek)
  const { error } = await supabase
    .from("site_settings")
    .update(sanitizedData)
    .eq("id", firstRow.id);

  if (error) {
    console.error("Supabase Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/hizli-teklif");
  
  return { success: true };
}



// 1. ÜRÜN İŞLEMLERİ
export async function saveProduct(id: string, payload: Record<string, unknown>) {
  const supabase = await createClient();
  
  const query = id === 'new' 
    ? supabase.from('products').insert([payload])
    : supabase.from('products').update(payload).eq('id', id);

  const { data, error } = await query;
  
  if (!error) {
    revalidatePath("/");
    revalidatePath("/products");
    if (typeof payload.slug === 'string') {
      revalidatePath(`/products/${payload.slug}`);
    }
    revalidatePath("/admin/products");
  }
  return { data, error };
}

// 2. BLOG İŞLEMLERİ
export async function savePost(id: string, payload: Record<string, unknown>) {
  const supabase = await createClient();
  
  // 'posts' olan yerleri 'blog_posts' olarak düzelttik
  const query = id === 'new' 
    ? supabase.from('blog_posts').insert([payload])
    : supabase.from('blog_posts').update(payload).eq('id', id);

  const { data, error } = await query;
  
  if (!error) {
    revalidatePath("/blog");
    if (typeof payload.slug === 'string') {
      revalidatePath(`/blog/${payload.slug}`);
    }
    revalidatePath("/admin/blog");
    // Eğer ana sayfada blog yazıları görünüyorsa burayı da ekleyebilirsiniz:
    revalidatePath("/");
  }
  return { data, error };
}

// 3. SABİT SAYFA İŞLEMLERİ (Hakkımızda vb.)
export async function savePage(id: string, payload: Record<string, unknown> & { slug?: string }) {
  const supabase = await createClient();
  
  const query = id === 'new' 
    ? supabase.from('pages').insert([payload])
    : supabase.from('pages').update(payload).eq('id', id);

  const { data, error } = await query;
  
  if (!error) {
    revalidatePath(`/${payload.slug}`);
    revalidatePath("/admin/pages");
  }
  return { data, error };
}

// app/admin/settings/actions.ts

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  
  // Silme işlemi
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (!error) {
    // Silinen ürünün ana sayfadan ve listeden anında kalkması için
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
  }
  
  return { error };
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (!error) {
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    revalidatePath("/");
  }
  return { error };
}