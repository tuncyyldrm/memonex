import { supabase } from "@/lib/supabase";

/**
 * Metni URL uyumlu hale getirir (SEO Dostu Slug)
 * Türkçe karakter desteği ve normalizasyon geliştirildi.
 */
export const slugify = (text: string): string => {
  const trMap: { [key: string]: string } = {
    'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C', 'ı': 'i', 'İ': 'i' // İ -> i düzeltildi
  };
  
  let fixedText = text;
  Object.keys(trMap).forEach(key => {
    fixedText = fixedText.replace(new RegExp(key, 'g'), trMap[key]);
  });

  return fixedText
    .normalize('NFD')                     // Aksanları ayırır
    .replace(/[\u0300-\u036f]/g, "")      // Ayrılan aksanları siler
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")             // Alfanümerik olmayanları sil
    .replace(/\s+/g, "-")                 // Boşlukları tireye çevir
    .replace(/-+/g, "-")                  // Ardışık tireleri tekilleştir
    .trim();
};

/**
 * Tarihi Türkiye formatında döner (Örn: 23 Şub 2026)
 */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * GÖRSELDEKİ HATAYI KESİN ÇÖZEN FONKSİYON:
 * HTML etiketlerini ve tüm (metin/sayısal) entity'leri temizler.
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";

  // 1. Önce HTML etiketlerini temizle
  let text = html.replace(/<[^>]*>/g, "");

  // 2. Yaygın Entity'leri manuel eşle (Görseldeki &#39; ve &nbsp; dahil)
  const entities: { [key: string]: string } = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>',
    '&#39;': "'",
    '&#039;': "'",
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&ndash;': '-',
    '&mdash;': '-'
  };

  Object.keys(entities).forEach(entity => {
    text = text.replace(new RegExp(entity, 'g'), entities[entity]);
  });

  // 3. Regex ile kalan tüm sayısal entity'leri (&#1234;) ve metin entity'leri temizle
  text = text.replace(/&(#?[a-z0-9]+);/gi, "");

  // 4. Fazla boşlukları tekilleştir
  return text.replace(/\s+/g, " ").trim();
};

/**
 * HTML içeriği içinden ilk görselin URL'sini ayıklar.
 */
export const getFirstImage = (html: string): string | null => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

/**
 * Supabase Storage'a güvenli dosya yüklemesi yapar.
 */
export const uploadImage = async (
  file: File, 
  bucket: string = 'media', 
  folder: string = 'products'
): Promise<string | null> => {
  if (!file.type.startsWith('image/')) {
    console.error("Hata: Geçersiz resim formatı.");
    return null;
  }

  try {
    const fileExt = file.name.split('.').pop();
    const cleanBaseName = slugify(file.name.replace(/\.[^/.]+$/, ""));
    const fileName = `${folder}/${Date.now()}-${cleanBaseName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false 
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Supabase Storage Yükleme Hatası:", error);
    return null;
  }
};