import { supabase } from "@/lib/supabase";

/**
 * Metni URL uyumlu hale getirir (SEO Dostu)
 * Türkçe karakter desteği ve özel sembol temizliği geliştirildi.
 */
export const slugify = (text: string) => {
  const trMap: { [key: string]: string } = {
    'ğ': 'g', 'Ğ': 'G', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C', 'ı': 'i', 'İ': 'I'
  };
  
  let fixedText = text;
  Object.keys(trMap).forEach(key => {
    fixedText = fixedText.replace(new RegExp(key, 'g'), trMap[key]);
  });

  return fixedText
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Harf, rakam ve tire dışındaki her şeyi sil
    .replace(/\s+/g, "-")      // Boşlukları tireye çevir
    .replace(/-+/g, "-")      // Ardışık tireleri tekilleştir
    .trim();
};

/**
 * Tarihi Türkiye formatında döner (Örn: 20 Şub 2026)
 */
export const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * HTML etiketlerini temizler ve metni ham hale getirir
 */
export const stripHtml = (html: string) => {
  if (!html) return "";
  // Etiketleri sil ve HTML entity'leri ( &nbsp; vb.) temizle
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

/**
 * HTML içinden ilk görselin URL'sini ayıklar
 */
export const getFirstImage = (html: string) => {
  if (!html) return null;
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

/**
 * Supabase Storage'a dosya yükler ve Public URL döner
 * Hata yönetimi ve dosya adı benzersizleştirme eklendi.
 */
export const uploadImage = async (
  file: File, 
  bucket: string = 'media', 
  folder: string = 'products'
) => {
  try {
    const fileExt = file.name.split('.').pop();
    const cleanBaseName = slugify(file.name.replace(/\.[^/.]+$/, ""));
    // Benzersizlik için: klasör/timestamp-isim.uzantı
    const fileName = `${folder}/${Date.now()}-${cleanBaseName}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Güvenlik için: mevcut dosyanın üzerine yazma
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error("Yükleme sırasında hata oluştu:", error);
    return null; // Hata durumunda null dönerek bileşeni kırma
  }
};