'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { slugify, uploadImage } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductEditor({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    featured: false,
    image: '',
    gallery: [] as string[],
    seo_title: '',
    seo_description: ''
  });

  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (id !== 'new') fetchProduct();
    else setIsInitialLoading(false);
  }, [id]);

  async function fetchProduct() {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name || '',
          price: data.price?.toString() || '',
          category: data.category || '',
          description: data.description || '',
          featured: data.featured || false,
          image: data.image || '',
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || ''
        });
      }
    } catch (err) {
      console.error("Ürün yükleme hatası:", err);
    } finally {
      setIsInitialLoading(false);
    }
  }

  // --- GÖRSEL YÜKLEME FONKSİYONLARI ---

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      // 'media' bucket ismini ve 'products' klasörünü gönderiyoruz
      const url = await uploadImage(file, 'media', 'products');
      setFormData(prev => ({ ...prev, image: url }));
    } catch (err: any) {
      console.error("Ana görsel yüklenemedi:", err);
      alert(`Görsel yüklenemedi: ${err.message || 'Bucket izinlerini kontrol edin.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setLoading(true);
      const uploadPromises = Array.from(files).map(file => 
        uploadImage(file, 'media', 'products')
      );
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
    } catch (err: any) {
      console.error("Galeri yükleme hatası:", err);
      alert("Bazı görseller yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  // --- KAYDETME FONKSİYONU ---

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert('İsim ve Fiyat zorunludur!');
    
    setLoading(true);
    const slug = slugify(formData.name);
    const payload = { 
      ...formData, 
      price: parseFloat(formData.price), 
      slug 
    };

    const query = id === 'new' 
      ? supabase.from('products').insert([payload])
      : supabase.from('products').update(payload).eq('id', id);

    const { error } = await query;
    
    if (error) {
      alert('Hata: ' + error.message);
    } else {
      router.push('/admin/products');
      router.refresh();
    }
    setLoading(false);
  };

  if (isInitialLoading) return (
    <div className="p-20 text-center font-black text-slate-200 animate-pulse uppercase tracking-[0.2em]">
      Veriler Hazırlanıyor...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-8 mt-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
          {id === 'new' ? '✨ Yeni Ürün' : '🛠️ Düzenle'}
        </h1>
        <div className="flex gap-4">
          <Link href="/admin/products" className="px-6 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-all text-xs tracking-widest uppercase">
            İptal
          </Link>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'İŞLEM YAPILIYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* SOL KOLON: İçerik */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Temel Bilgiler</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-5 text-xl font-bold border border-slate-100 bg-slate-50/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                placeholder="Ürün Adı" 
              />
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows={5} 
                className="w-full p-5 text-lg border border-slate-100 bg-slate-50/50 rounded-2xl outline-none resize-none focus:ring-4 focus:ring-blue-50 transition-all" 
                placeholder="Ürün açıklaması ve teknik detaylar..." 
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Ürün Galerisi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.gallery.map((url, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden relative group border border-slate-100 shadow-sm">
                  <img src={url} className="w-full h-full object-cover" alt={`Galeri ${index}`} />
                  <button 
                    onClick={() => removeGalleryImage(index)} 
                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-xs"
                  >
                    SİL
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:border-blue-400">
                <span className="text-3xl text-slate-300 font-light">+</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Görsel Ekle</span>
                <input type="file" multiple onChange={handleGalleryUpload} className="hidden" accept="image/*" />
              </label>
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6">
            <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Arama Motoru Ayarları</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="SEO Başlığı" 
                value={formData.seo_title} 
                onChange={(e) => setFormData({...formData, seo_title: e.target.value})} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm" 
              />
              <textarea 
                placeholder="SEO Açıklaması" 
                value={formData.seo_description} 
                onChange={(e) => setFormData({...formData, seo_description: e.target.value})} 
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-blue-500 transition-all text-sm resize-none" 
              />
            </div>
          </section>
        </div>

        {/* SAĞ KOLON: Ayarlar */}
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Ana Görsel (Kapak)</h2>
            <div className="aspect-square rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden relative flex items-center justify-center group">
              {formData.image ? (
                <>
                  <img src={formData.image} className="w-full h-full object-cover" alt="Kapak" />
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white font-black text-xs uppercase tracking-widest">
                    DEĞİŞTİR
                    <input type="file" onChange={handleMainImageUpload} className="hidden" accept="image/*" />
                  </label>
                </>
              ) : (
                <label className="flex flex-col items-center cursor-pointer p-4 group">
                  <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Görsel Yükle</span>
                  <input type="file" onChange={handleMainImageUpload} className="hidden" accept="image/*" />
                </label>
              )}
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Fiyat (TL)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                className="w-full p-4 text-2xl font-black text-blue-600 bg-blue-50/30 rounded-2xl outline-none" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Kategori</label>
              <select 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none cursor-pointer appearance-none"
              >
                <option value="">Seçiniz</option>
                <option value="Mekanik">Mekanik Parçalar</option>
                <option value="Figür">Figür & Sanat</option>
                <option value="Endüstriyel">Endüstriyel</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Ana Sayfada Göster</span>
              <input 
                type="checkbox" 
                checked={formData.featured} 
                onChange={(e) => setFormData({...formData, featured: e.target.checked})} 
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}