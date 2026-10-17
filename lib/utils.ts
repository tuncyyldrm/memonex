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
 * İstemci tarafında görselleri otomatik sıkıştırır ve WebP formatına çevirir.
 * Bu sayede 5-10 MB'lık ham telefon/kamera fotoğrafları 100-250 KB'a düşer (%95+ tasarruf).
 */
export const compressImage = async (
  file: File,
  maxWidth: number = 1600,
  maxHeight: number = 1600,
  quality: number = 0.82
): Promise<File> => {
  if (typeof window === 'undefined') return file;
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const cleanBaseName = slugify(file.name.replace(/\.[^/.]+$/, ""));
            const compressedFile = new File([blob], `${cleanBaseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            // Eğer sıkıştırılmış dosya orijinalinden daha küçükse onu kullan
            resolve(compressedFile.size < file.size ? compressedFile : file);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

/**
 * Supabase Storage'a güvenli ve optimize dosya yüklemesi yapar.
 * - Otomatik WebP ve boyut optimizasyonu uygular.
 * - Cache-Control başlığını 1 yıl (31536000 saniye, immutable) olarak ayarlar;
 *   böylece Supabase Egress tüketimi kökten düşürülür.
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
    const optimizedFile = await compressImage(file);
    const fileExt = optimizedFile.name.split('.').pop() || 'webp';
    const cleanBaseName = slugify(optimizedFile.name.replace(/\.[^/.]+$/, ""));
    const fileName = `${folder}/${Date.now()}-${cleanBaseName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, optimizedFile, {
        cacheControl: 'public, max-age=31536000, immutable',
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

/**
 * 3D Baskı saatlik ücret, taban fiyat ve teslimat notunu ayrıştırır.
 */
export function parseDeliveryAndPricing(raw?: string | null) {
  const fallback = {
    hourlyRate: 110,
    minOrderPrice: 100,
    deliveryNote: "* Bu model Isparta merkezli atölyemizde üretilmektedir."
  };
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return {
      hourlyRate: Number(parsed.hourly_rate) || fallback.hourlyRate,
      minOrderPrice: Number(parsed.min_order_price) || fallback.minOrderPrice,
      deliveryNote: typeof parsed.delivery_note === 'string' ? parsed.delivery_note : fallback.deliveryNote
    };
  } catch {
    return {
      ...fallback,
      deliveryNote: String(raw)
    };
  }
}