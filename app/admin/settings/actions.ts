"use server";

// 1. ÖNEMLİ: Yeni asenkron client'ı çağırıyoruz
import { createClient } from "@/lib/supabase-server"; 
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  // 2. Client'ı asenkron olarak oluştur (AWAIT ŞART)
  const supabase = await createClient(); 

  const rawData = Object.fromEntries(formData.entries());
  
  const formattedData: any = {
    ...rawData,
    shipping_days_min: Number(rawData.shipping_days_min) || 0,
    shipping_days_max: Number(rawData.shipping_days_max) || 0,
    handling_time_max: Number(rawData.handling_time_max) || 0,
    allow_ai_bots: rawData.allow_ai_bots === "true",
    price_valid_until: rawData.price_valid_until || null,
    ga_tracking_id: rawData.ga_tracking_id || null,
    og_image_default: rawData.og_image_default || null,
    updated_at: new Date().toISOString(),
  };

  // 3. ID çekme işlemini de yeni asenkron supabase ile yapıyoruz
  const { data: firstRow, error: fetchError } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .single();

  if (fetchError || !firstRow) {
    return { success: false, message: "Ayar satırı bulunamadı." };
  }

  // 4. Güncelleme işlemi (Artık RLS hatası vermeyecek)
  const { error } = await supabase
    .from("site_settings")
    .update(formattedData)
    .eq("id", firstRow.id);

  if (error) {
    console.error("Supabase Error:", error.message);
    return { success: false, message: error.message };
  }

  revalidatePath("/", "layout");
  
  return { success: true };
}



// 1. ÜRÜN İŞLEMLERİ
export async function saveProduct(id: string, payload: any) {
  const supabase = await createClient();
  
  const query = id === 'new' 
    ? supabase.from('products').insert([payload])
    : supabase.from('products').update(payload).eq('id', id);

  const { data, error } = await query;
  
  if (!error) {
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
  }
  return { data, error };
}

// 2. BLOG İŞLEMLERİ
export async function savePost(id: string, payload: any) {
  const supabase = await createClient();
  
  // 'posts' olan yerleri 'blog_posts' olarak düzelttik
  const query = id === 'new' 
    ? supabase.from('blog_posts').insert([payload])
    : supabase.from('blog_posts').update(payload).eq('id', id);

  const { data, error } = await query;
  
  if (!error) {
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    // Eğer ana sayfada blog yazıları görünüyorsa burayı da ekleyebilirsiniz:
    revalidatePath("/");
  }
  return { data, error };
}

// 3. SABİT SAYFA İŞLEMLERİ (Hakkımızda vb.)
export async function savePage(id: string, payload: any) {
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
    revalidatePath("/admin/products");
  }
  
  return { error };
}