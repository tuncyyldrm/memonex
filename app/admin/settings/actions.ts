"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // 1. Veri Dönüştürme ve Formatlama
  const formattedData: any = {
    ...rawData,
    
    // Sayısal Değerleri zorunlu olarak Integer'a çeviriyoruz
    shipping_days_min: Number(rawData.shipping_days_min) || 0,
    shipping_days_max: Number(rawData.shipping_days_max) || 0,
    handling_time_max: Number(rawData.handling_time_max) || 0,
    
    // Checkbox Mantığı (SettingsForm'dan gelen "true"/"false" string kontrolü)
    allow_ai_bots: rawData.allow_ai_bots === "true",
    
    // Boş stringleri veritabanında NULL olarak saklamak SEO ve Schema sağlığı için kritiktir
    price_valid_until: rawData.price_valid_until || null,
    ga_tracking_id: rawData.ga_tracking_id || null,
    og_image_default: rawData.og_image_default || null,
    
    // Manuel update zaman damgası
    updated_at: new Date().toISOString(),
  };

  // 2. İlk kaydı güncelle (Genelde site_settings tablosunda tek satır olur)
  // Eğer tablonuzda ID farklıysa, önce ID'yi çekip sonra update etmek en güvenli yoldur.
  // Burada genel bir yaklaşım için ilk kaydı hedefliyoruz.
  const { data: firstRow } = await supabase.from("site_settings").select("id").limit(1).single();

  if (!firstRow) {
    return { success: false, message: "Ayar satırı bulunamadı. Lütfen veritabanını kontrol edin." };
  }

  const { error } = await supabase
    .from("site_settings")
    .update(formattedData)
    .eq("id", firstRow.id);

  if (error) {
    console.error("Supabase Error:", error.message);
    return { success: false, message: error.message };
  }

  // 3. Önbelleği Temizle
  // "layout" seçeneği tüm sayfaların meta verilerini ve ayarlarını anında günceller.
  revalidatePath("/", "layout");
  
  return { success: true };
}