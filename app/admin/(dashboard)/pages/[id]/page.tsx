"use client";
import { useEffect, useState, use } from "react"; // 'use' hook'u params için gerekli
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // URL'deki UUID'yi güvenli bir şekilde alıyoruz
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    seo_title: "",
    seo_description: ""
  });

  // Mevcut verileri çek
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
          seo_description: data.seo_description || ""
        });
      }
      setLoading(false);
    };

    fetchPage();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await supabase
      .from("pages")
      .update(formData)
      .eq("id", id);

    if (!error) {
      router.push("/admin/pages");
      router.refresh();
    } else {
      alert("Güncelleme hatası: " + error.message);
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-10 font-black animate-pulse text-slate-400">VERİLER YÜKLENİYOR...</div>;

  return (
    <form onSubmit={handleUpdate} className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-blue-600">SAYFAYI DÜZENLE</h2>
          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest italic">ID: {id.slice(0,8)}...</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">BAŞLIK</label>
            <input 
              required
              value={formData.title}
              className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold focus:ring-4 ring-blue-500/10 outline-none transition-all"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">SLUG</label>
            <input 
              required
              value={formData.slug}
              className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold italic text-blue-600 focus:ring-4 ring-blue-500/10 outline-none transition-all"
              onChange={(e) => setFormData({...formData, slug: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">İÇERİK</label>
          <textarea 
            rows={12}
            value={formData.content}
            className="bg-slate-50 border border-slate-100 p-8 rounded-[2rem] text-sm font-medium focus:ring-4 ring-blue-500/10 outline-none transition-all leading-relaxed"
            onChange={(e) => setFormData({...formData, content: e.target.value})}
          />
        </div>
      </div>

      <button 
        type="submit"
        disabled={updating}
        className="w-full bg-slate-900 text-white p-8 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-blue-600 transition-all shadow-2xl active:scale-[0.97] disabled:opacity-50"
      >
        {updating ? "GÜNCELLENİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
      </button>
    </form>
  );
}