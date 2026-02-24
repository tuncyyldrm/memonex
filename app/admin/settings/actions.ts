"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Veritabanı şemasına göre verileri formatlıyoruz
  const formattedData: any = {
    ...rawData,
    
    // Sayısal Değerler (Integer)
    shipping_days_min: rawData.shipping_days_min ? parseInt(rawData.shipping_days_min as string) : 0,
    shipping_days_max: rawData.shipping_days_max ? parseInt(rawData.shipping_days_max as string) : 0,
    handling_time_max: rawData.handling_time_max ? parseInt(rawData.handling_time_max as string) : 0,
    
    // Koordinatlar (Şemada text olduğu için string olarak gönderiyoruz)
    geo_latitude: rawData.geo_latitude?.toString() || null,
    geo_longitude: rawData.geo_longitude?.toString() || null,
    
    // Boolean (Checkbox)
    allow_ai_bots: rawData.allow_ai_bots === "on",
    
    // Tarih ve Zaman
    price_valid_until: rawData.price_valid_until || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("site_settings")
    .update(formattedData)
    .eq("id", "00000000-0000-0000-0000-000000000000");

  if (error) {
    console.error("Memonex SQL Error:", error.message);
    return { success: false, message: error.message };
  }

  // Tüm siteyi yeni ayarlarla yenile
  revalidatePath("/", "layout");
  return { success: true };
}