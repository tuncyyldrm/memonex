"use client";

import { updateSettings } from "./actions";
import { useState } from "react";

export default function SettingsForm({ initialData: s }: { initialData: any }) {
  const [status, setStatus] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    // Checkbox yönetimi: FormData içinde gelmezse 'false' olarak set etmeliyiz
    if (!formData.get("allow_ai_bots")) {
      formData.append("allow_ai_bots", "false");
    } else {
      formData.set("allow_ai_bots", "true");
    }

    setStatus("Veriler işleniyor ve buluta yükleniyor...");
    const result = await updateSettings(formData);
    
    if (result.success) {
      setStatus("Sistem başarıyla güncellendi ✅");
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus(`Hata: ${result.message} ❌`);
    }
  }

  return (
    <form action={clientAction} id="settings-form" className="space-y-12 pb-20">
      {status && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 font-bold text-[10px] border border-blue-500/50 backdrop-blur-md uppercase tracking-widest">
          {status}
        </div>
      )}

      {/* 1. MARKA & GÖRSEL KİMLİK */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase tracking-tight">Marka Kimliği</h3>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">Sitenin ana karakterini belirleyen başlıklar ve sloganlar.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marka Adı" name="brand_name" val={s.brand_name} />
          <Input label="Suffix (örn: 3D)" name="brand_suffix" val={s.brand_suffix} />
          <Input label="Logo Alt Metni" name="logo_subtext" val={s.logo_subtext} />
          <Input label="Vurgu Rengi (Hex)" name="accent_color_hex" val={s.accent_color_hex} placeholder="#2563eb" />
          <div className="sm:col-span-2">
            <Input label="Global Slogan" name="brand_slogan" val={s.brand_slogan} />
          </div>
          <Input label="Katalog Boş Mesajı" name="catalog_empty_msg" val={s.catalog_empty_msg} />
          <Input label="Blog Boş Mesajı" name="blog_empty_msg" val={s.blog_empty_msg} />
        </div>
      </section>

      {/* 2. SEO & KRİTİK AYARLAR */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase text-blue-600">SEO & Metadata</h3>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">Arama motorları, botlar ve sosyal medya yapılandırması.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 flex items-center gap-4 bg-blue-50/50 p-5 rounded-3xl border-2 border-blue-100 mb-2">
            <input 
              type="checkbox" 
              name="allow_ai_bots" 
              id="allow_ai_bots"
              defaultChecked={s.allow_ai_bots} 
              className="w-6 h-6 rounded-lg accent-blue-600 cursor-pointer"
            />
            <label htmlFor="allow_ai_bots" className="text-[10px] font-black uppercase text-blue-600 cursor-pointer select-none">
              Arama Motoru İndekslemeye İzin Ver (Örn: Google, AI Botları)
            </label>
          </div>
          <Input label="Site URL" name="site_url" val={s.site_url} placeholder="https://memonex3d.com" />
          <Input label="Analytics ID (GA4)" name="ga_tracking_id" val={s.ga_tracking_id} placeholder="G-XXXXXXXXXX" />
          <Input label="Ana OG Görsel (URL)" name="og_image_default" val={s.og_image_default} />
          <Input label="Katalog OG Görsel (URL)" name="og_image_products" val={s.og_image_products} />
          <Input label="Blog OG Görsel (URL)" name="og_image_blog" val={s.og_image_blog} />
          <Input label="SEO Başlık Taslağı" name="site_title_template" val={s.site_title_template} placeholder="%s | Marka" />
          <div className="sm:col-span-2">
             <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Varsayılan Meta Açıklaması</label>
             <textarea name="site_description_default" defaultValue={s.site_description_default} className="admin-input-field h-24 resize-none" />
          </div>
        </div>
      </section>

      {/* 3. HERO & TASARIM */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase">Hero & Arayüz</h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Açılış ekranı ve genel tasarım ovalliği.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Hero Üst Başlık" name="hero_title_upper" val={s.hero_title_upper} />
          <Input label="Hero Alt Başlık" name="hero_title_lower" val={s.hero_title_lower} />
          <Input label="Kart Radius (örn: 2.5rem)" name="border_radius_large" val={s.border_radius_large} />
          <Input label="Bölüm Radius (örn: 4rem)" name="border_radius_section" val={s.border_radius_section} />
        </div>
      </section>

      {/* 4. ÜRETİM & LOJİSTİK */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase text-orange-600">Lojistik & Üretim</h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Kargo ve varsayılan teknik parametreler.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Para Birimi" name="price_currency" val={s.price_currency} />
          <Input label="Fiyat Geçerlilik" name="price_valid_until" val={s.price_valid_until} type="date" />
          <Input label="Hazırlık Süresi (Maks)" name="handling_time_max" val={s.handling_time_max} type="number" />
          <Input label="Kargo Min (Gün)" name="shipping_days_min" val={s.shipping_days_min} type="number" />
          <Input label="Kargo Max (Gün)" name="shipping_days_max" val={s.shipping_days_max} type="number" />
          <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Varsayılan Teknoloji" name="default_tech" val={s.default_tech} />
            <Input label="Varsayılan Materyal" name="default_material" val={s.default_material} />
            <Input label="Varsayılan Hassasiyet" name="default_precision" val={s.default_precision} />
          </div>
          <div className="sm:col-span-3">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Varsayılan Teslimat Notu</label>
            <textarea name="default_delivery_note" defaultValue={s.default_delivery_note} className="admin-input-field h-20 resize-none" />
          </div>
        </div>
      </section>

      {/* 5. İLETİŞİM & ADRES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase">İletişim & Konum</h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">WhatsApp ve Coğrafi veriler.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="WhatsApp No" name="whatsapp_no" val={s.whatsapp_no} />
          <Input label="Instagram URL" name="instagram_url" val={s.instagram_url} />
          <Input label="TikTok URL" name="tiktok_url" val={s.tiktok_url} />
          <Input label="E-Posta" name="contact_email" val={s.contact_email} />
          <Input label="Enlem (Latitude)" name="geo_latitude" val={s.geo_latitude} />
          <Input label="Boylam (Longitude)" name="geo_longitude" val={s.geo_longitude} />
          <div className="sm:col-span-2">
            <Input label="WhatsApp Mesaj Şablonu" name="wa_default_msg" val={s.wa_default_msg} />
            <div className="mt-4">
               <Input label="Atölye Açık Adres" name="workshop_address" val={s.workshop_address} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. HATA SAYFALARI */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase text-red-600">404 Sayfası</h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Sayfa bulunamadığında gösterilecek metinler.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="404 Emoji" name="not_found_emoji" val={s.not_found_emoji} />
          <Input label="404 Başlık" name="not_found_title" val={s.not_found_title} />
        </div>
      </section>

      <div className="flex justify-end pt-12">
          <button 
            type="submit"
            className="bg-blue-600 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-900 transition-all active:scale-95 shadow-blue-500/20"
          >
            Tüm Ayarları Kaydet
          </button>
      </div>

      <style jsx>{`
        .admin-input-field {
          @apply w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-blue-600 focus:bg-white outline-none transition-all;
        }
      `}</style>
    </form>
  );
}

function Input({ label, name, val, type = "text", placeholder = "" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
      <input 
        type={type} 
        name={name} 
        defaultValue={val} 
        placeholder={placeholder}
        className="admin-input-field" 
      />
    </div>
  );
}