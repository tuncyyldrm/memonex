'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Kendi dosya yoluna göre kontrol et

interface Filament {
  id: string;
  material: string;
  color_name: string;
  color_hex: string;
  is_active: boolean;
  price_multiplier: number;
  created_at?: string;
}

const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Power: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>,
  Loader: () => <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line></svg>
};

export default function FilamentManager() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const initialForm = { material: 'pla', color_name: '', color_hex: '#2563eb', is_active: true, price_multiplier: 1.0 };
  const [formData, setFormData] = useState<Partial<Filament>>(initialForm);

  useEffect(() => { fetchFilaments(); }, []);

  const fetchFilaments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('filaments').select('*').order('created_at', { ascending: false });
    if (!error) setFilaments(data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.color_name) return alert("Renk ismi boş olamaz!");
    setActionLoading(true);

    if (editId) {
      // GÜNCELLEME MODU
      const { error } = await supabase.from('filaments').update(formData).eq('id', editId);
      if (!error) {
        setFilaments(filaments.map(f => f.id === editId ? { ...f, ...formData } as Filament : f));
        setEditId(null);
        setFormData(initialForm);
      }
    } else {
      // EKLEME MODU
      const { data, error } = await supabase.from('filaments').insert([formData]).select();
      if (!error && data) {
        setFilaments([data[0], ...filaments]);
        setFormData(initialForm);
      }
    }
    setActionLoading(false);
  };

  const startEdit = (f: Filament) => {
    setEditId(f.id);
    setFormData({ 
      material: f.material, 
      color_name: f.color_name, 
      color_hex: f.color_hex, 
      price_multiplier: f.price_multiplier,
      is_active: f.is_active 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase.from('filaments').update({ is_active: !currentState }).eq('id', id);
    if (!error) setFilaments(filaments.map(f => f.id === id ? { ...f, is_active: !currentState } : f));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kalıcı olarak silinsin mi?")) return;
    const { error } = await supabase.from('filaments').delete().eq('id', id);
    if (!error) setFilaments(filaments.filter(f => f.id !== id));
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto min-h-screen">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">
          Filament <span className="text-blue-600 italic">Envanteri</span>
        </h1>
        {editId && (
          <button onClick={() => { setEditId(null); setFormData(initialForm); }} className="text-red-500 text-[10px] font-black uppercase flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
            <Icons.X /> DÜZENLEMEYİ İPTAL ET
          </button>
        )}
      </div>

      {/* DİNAMİK FORM (EKLE / GÜNCELLE) */}
      <div className={`p-6 md:p-8 rounded-[2.5rem] border-2 transition-all grid grid-cols-1 md:grid-cols-5 gap-4 items-end ${editId ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Malzeme</label>
          <select 
            value={formData.material}
            onChange={(e) => setFormData({...formData, material: e.target.value})}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-blue-600"
          >
            <option value="pla">PLA</option>
            <option value="petg">PETG</option>
            <option value="abs">ABS</option>
            <option value="tpu">TPU</option>
          </select>
        </div>

        <div className="space-y-2 md:col-span-2 text-slate-800">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Renk Adı & Kod</label>
          <div className="flex gap-2">
            <input 
              type="text" placeholder="Renk ismi..."
              value={formData.color_name}
              onChange={(e) => setFormData({...formData, color_name: e.target.value})}
              className="flex-1 bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-blue-600"
            />
            <input 
              type="color" 
              value={formData.color_hex}
              onChange={(e) => setFormData({...formData, color_hex: e.target.value})}
              className="w-16 h-[58px] bg-white border-2 border-slate-200 rounded-2xl p-1 cursor-pointer"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-blue-600 ml-2 italic">Maliyet Çarpanı</label>
          <input 
            type="number" step="0.05"
            value={isNaN(formData.price_multiplier as number) ? '' : formData.price_multiplier}
            onChange={(e) => setFormData({...formData, price_multiplier: isNaN(parseFloat(e.target.value)) ? 1 : parseFloat(e.target.value)})}
            className="w-full bg-white border-2 border-slate-200 rounded-2xl p-4 font-bold text-sm outline-none focus:border-blue-600"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={actionLoading}
          className={`h-[58px] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
            editId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-blue-600'
          }`}
        >
          {actionLoading ? <Icons.Loader /> : editId ? <><Icons.Save /> GÜNCELLE</> : <><Icons.Plus /> EKLE</>}
        </button>
      </div>

      {/* LİSTE */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-slate-300 font-black uppercase tracking-widest">Yükleniyor...</div>
        ) : (
          filaments.map((f) => (
            <div key={f.id} className={`p-4 rounded-[2rem] border-2 flex items-center justify-between transition-all ${f.is_active ? 'bg-white border-slate-50 shadow-sm' : 'bg-slate-50/50 border-transparent opacity-60'}`}>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl shadow-inner border-2 border-white" style={{ backgroundColor: f.color_hex }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-slate-900 text-white uppercase">{f.material}</span>
                    <h3 className="font-black text-slate-800 text-sm uppercase italic">{f.color_name}</h3>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Katsayı: x{f.price_multiplier}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(f.id, f.is_active)} className={`p-3 rounded-xl transition-all ${f.is_active ? 'text-green-500 bg-green-50' : 'text-slate-300 bg-slate-100'}`}>
                  <Icons.Power />
                </button>
                <button onClick={() => startEdit(f)} className="p-3 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                  <Icons.Edit />
                </button>
                <button onClick={() => handleDelete(f.id)} className="p-3 text-red-400 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                  <Icons.Trash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}