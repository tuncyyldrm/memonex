"use client";

import { updateSettings } from "./actions";
import { useState } from "react";

export default function SettingsForm({ initialData: s }: { initialData: any }) {
  const [status, setStatus] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
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
        <div className="fixed top-5 right-5 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 font-bold text-xs border border-blue-500/50 backdrop-blur-md">
          {status}
        </div>
      )}

      {/* 1. MARKA & GÖRSEL KİMLİK */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase tracking-tight">Marka Kimliği</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">Sitenin ana karakterini belirleyen başlıklar ve sloganlar.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marka Adı" name="brand_name" val={s.brand_name} />
          <Input label="Suffix (örn: 3D)" name="brand_suffix" val={s.brand_suffix} />
          <Input label="Logo Alt Metni" name="logo_subtext" val={s.logo_subtext} />
          <Input label="Vurgu Rengi (Hex)" name="accent_color_hex" val={s.accent_color_hex} />
          <div className="sm:col-span-2">
            <Input label="Global Slogan" name="brand_slogan" val={s.brand_slogan} />
          </div>
        </div>
      </section>

      {/* 2. HERO & TASARIM PARAMETRELERİ */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase">Hero & Layout</h3>
          <p className="text-xs text-slate-400 font-medium">Giriş ekranı metinleri ve köşe yumuşatma değerleri.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Hero Üst Başlık" name="hero_title_upper" val={s.hero_title_upper} />
          <Input label="Hero Alt Başlık" name="hero_title_lower" val={s.hero_title_lower} />
          <Input label="Kart Radius" name="border_radius_large" val={s.border_radius_large} />
          <Input label="Bölüm Radius" name="border_radius_section" val={s.border_radius_section} />
        </div>
      </section>

      {/* 3. SEO & SOSYAL MEDYA */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase text-blue-600">SEO & Metadata</h3>
          <p className="text-xs text-slate-400 font-medium">Arama motorları ve sosyal ağlar için yapılandırma.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Site URL" name="site_url" val={s.site_url} />
          <Input label="Analytics ID (GA4)" name="ga_tracking_id" val={s.ga_tracking_id} />
          <Input label="Instagram URL" name="instagram_url" val={s.instagram_url} />
          <Input label="TikTok URL" name="tiktok_url" val={s.tiktok_url} />
          <div className="sm:col-span-2">
            <Input label="SEO Başlık Taslağı" name="site_title_template" val={s.site_title_template} />
            <div className="mt-4">
               <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Varsayılan SEO Açıklaması</label>
               <textarea name="site_description_default" defaultValue={s.site_description_default} className="admin-input-field h-24 resize-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. ÜRETİM & LOJİSTİK */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase text-orange-600">Üretim & Lojistik</h3>
          <p className="text-xs text-slate-400 font-medium">Baskı teknolojisi ve kargo süreleri.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Kargo Min (Gün)" name="shipping_days_min" val={s.shipping_days_min} type="number" />
          <Input label="Kargo Max (Gün)" name="shipping_days_max" val={s.shipping_days_max} type="number" />
          <Input label="Hazırlık (Gün)" name="handling_time_max" val={s.handling_time_max} type="number" />
          <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Teknoloji" name="default_tech" val={s.default_tech} />
            <Input label="Materyal" name="default_material" val={s.default_material} />
            <Input label="Hassasiyet" name="default_precision" val={s.default_precision} />
          </div>
        </div>
      </section>

      {/* 5. İLETİŞİM & ADRES */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t-2 border-slate-100 pt-8">
        <aside>
          <h3 className="text-lg font-black italic uppercase">İletişim & Harita</h3>
          <p className="text-xs text-slate-400 font-medium">Atölye konumu ve WhatsApp erişimi.</p>
        </aside>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="WhatsApp No" name="whatsapp_no" val={s.whatsapp_no} />
          <Input label="E-Posta" name="contact_email" val={s.contact_email} />
          <Input label="Enlem (Lat)" name="geo_latitude" val={s.geo_latitude} />
          <Input label="Boylam (Long)" name="geo_longitude" val={s.geo_longitude} />
          <div className="sm:col-span-2">
            <Input label="Atölye Açık Adres" name="workshop_address" val={s.workshop_address} />
          </div>
        </div>
      </section>

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