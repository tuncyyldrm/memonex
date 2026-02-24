import { supabase } from "@/lib/supabase";
import SettingsForm from "./SettingsForm";
import Link from "next/link";
import "@/app/globals.css";

export default async function AdminSettingsPage() {
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "00000000-0000-0000-0000-000000000000")
    .single();

  const safeSettings = settings || {};

  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto min-h-screen bg-white custom-content selection:bg-blue-100 selection:text-blue-900">
      
      {/* Üst Header Bölümü */}
      <div className="flex flex-col gap-8 mb-16">
        <Link 
          href="/admin" 
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 hover:text-blue-600 transition-all w-fit"
        >
          <span className="bg-slate-100 group-hover:bg-blue-600 group-hover:text-white w-6 h-6 flex items-center justify-center rounded-full transition-all">←</span> 
          Kontrol Paneline Dön
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[6px] border-slate-900 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Sistem Çekirdeği</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter !m-0 leading-[0.85]">
              SİSTEM <span className="text-blue-600">AYARLARI</span>
            </h1>
          </div>
          
          <button 
            form="settings-form" 
            type="submit"
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95 hover:-translate-y-1"
          >
            Değişiklikleri Yayınla
          </button>
        </div>
      </div>
      
      <SettingsForm initialData={safeSettings} />
    </div>
  );
}