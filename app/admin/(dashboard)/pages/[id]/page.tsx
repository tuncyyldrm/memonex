"use client";
import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: "",
  });

  useEffect(() => {
    const fetchPage = async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (data && !error) {
        setFormData({
          title: data.title || "",
          slug: data.slug || "",
          content: data.content || "",
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
        });
      }
      setLoading(false);
    };

    fetchPage();
  }, [id]);

  // Otomatik Slug Oluşturucu
  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, slug });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await supabase
      .from("pages")
      .update({
        ...formData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (!error) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      alert("Hata: " + error.message);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Veriler Senkronize Ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Üst Navigasyon */}
      <div className="flex items-center justify-between mb-10">
        <Link 
          href="/admin/pages" 
          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-2"
        >
          ← Listeye Dön
        </Link>
        <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Düzenleme Modu Aktif</span>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* ANA İÇERİK PANELİ */}
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
          <header className="border-b border-slate-50 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">
                SAYFA <span className="text-blue-600">İÇERİĞİ</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Sistem UUID: {id}</p>
            </div>
            <button 
              type="button"
              onClick={generateSlug}
              className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              Başlıktan Slug Üret ⚡
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Sayfa Başlığı</label>
              <input 
                required
                value={formData.title}
                placeholder="Örn: Hakkımızda"
                className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-base font-bold text-slate-900 focus:ring-4 ring-blue-500/5 outline-none transition-all placeholder:opacity-30"
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">URL Uzantısı (Slug)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">/</span>
                <input 
                  required
                  value={formData.slug}
                  className="w-full bg-slate-50 border border-slate-100 p-6 pl-10 rounded-2xl text-base font-bold italic text-blue-600 focus:ring-4 ring-blue-500/5 outline-none transition-all"
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Ana Metin İçeriği</label>
            <textarea 
              rows={12}
              value={formData.content}
              placeholder="Sayfa içeriğini buraya girin..."
              className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] text-sm font-medium focus:ring-4 ring-blue-500/5 outline-none transition-all leading-relaxed text-slate-600"
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>
        </div>

        {/* SEO PANELİ (Koyu Tema) */}
        <div className="bg-[#0F172A] p-8 md:p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-white text-9xl font-black italic pointer-events-none">SEO</div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-sm">🔍</div>
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Arama Motoru Optimizasyonu</h3>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Google Başlığı (SEO Title)</label>
                <input 
                  value={formData.seo_title}
                  placeholder="Arama sonuçlarında görünecek başlık"
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                  onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">Meta Açıklaması (Description)</label>
                <textarea 
                  rows={3}
                  value={formData.seo_description}
                  placeholder="Sayfanın kısa özeti..."
                  className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm font-medium text-slate-400 outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-700"
                  onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AKSİYON BUTONU */}
        <button 
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 text-white p-10 rounded-[3rem] font-black uppercase tracking-[0.5em] text-xs hover:bg-slate-900 transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
        >
          {updating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              İŞLENİYOR...
            </>
          ) : "SİSTEMİ GÜNCELLE VE YAYINLA"}
        </button>
      </form>
    </div>
  );
}