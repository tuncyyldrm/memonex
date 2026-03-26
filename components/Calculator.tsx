'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { supabase } from '@/lib/supabase';

// DİKKAT: @react-three/fiber importu buradan kaldırıldı. 
// ModelViewer'ı Next.js 16 hatasından kaçınmak için dinamik (client-side) yüklüyoruz.
import dynamic from 'next/dynamic';

const ModelViewer = dynamic(() => import('./ModelViewer'), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-[550px] bg-slate-100 animate-pulse rounded-[4rem] flex items-center justify-center">
       <span className="text-slate-400 font-black tracking-widest uppercase text-xs">3D Motoru Hazırlanıyor...</span>
    </div>
  )
});

interface Filament {
  id: string;
  material: string;
  color_name: string;
  color_hex: string;
  price_multiplier: number;
}

interface Stats {
  volume: number; // weight yerine volume geldi
  x: number;
  y: number;
  z: number;
}

// ... bileşen devamı

export default function Calculator() {
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);
  
  const [dbFilaments, setDbFilaments] = useState<Filament[]>([]);
  
  const [options, setOptions] = useState({ 
    material: 'pla', 
    infill: 20, 
    resolution: 0.2, 
    color: '', 
    colorHex: '#2563eb',
    multiplier: 1.0 
  });
// Malzeme değişimini yöneten yardımcı fonksiyon
  const handleMaterialChange = (m: string) => {
    const firstMatch = dbFilaments.find(f => f.material === m);
    setOptions(prev => ({
      ...prev,
      material: m, 
      color: firstMatch?.color_name || '', 
      colorHex: firstMatch?.color_hex || '#ccc',
      multiplier: firstMatch?.price_multiplier || 1.0
    }));
  };

// --- VERİTABANI BAĞLANTISI (MEMONEX OPTİMİZE) ---
useEffect(() => {
  let isMounted = true; // Memory leak ve state güncelleme hatasını önlemek için

  const fetchFilaments = async () => {
    try {
      const { data, error } = await supabase
        .from('filaments')
        .select('*')
        .eq('is_active', true)
        .order('material', { ascending: true }); // Malzemeleri alfabetik sırala

      if (error) throw error;

      if (isMounted && data) {
        setDbFilaments(data);
        
        // Varsayılan olarak PLA, yoksa listedeki ilk filament
        const defaultFilament = data.find(f => f.material.toLowerCase() === 'pla') || data[0];
        
        if (defaultFilament) {
          setOptions(prev => ({
            ...prev,
            material: defaultFilament.material,
            color: defaultFilament.color_name,
            colorHex: defaultFilament.color_hex,
            multiplier: defaultFilament.price_multiplier
          }));
        }
      }
    } catch (err) {
      console.error("Memonex Filament Yükleme Hatası:", err);
    } finally {
      if (isMounted) setDbLoading(false);
    }
  };

  fetchFilaments();

  return () => { isMounted = false; }; // Bileşen kapanırsa işlemi durdur
}, []);

// --- GELİŞMİŞ HESAPLAMA MOTORU (MEMONEX V5.1 - GYROID OPTIMIZED) ---
// --- GELİŞMİŞ HESAPLAMA MOTORU ---
const calculatedData = useMemo(() => {
  if (!stats) return { weight: 0, hours: 0, price: 0, formattedTime: "" };

  const infillPercentage = options.infill / 100;
  
  // 1. GERÇEKÇİ AĞIRLIK HESABI
  // %100 Dolu Ağırlık (PLA Yoğunluğu: 1.24)
  const fullSolidWeight = (stats.volume / 1000) * 1.24; 

  // Slicer Mantığı: %25 Kabuk (Sabit), Geri kalanı dolguya bağlı
  const shellWeight = fullSolidWeight * 0.25; 
  const internalWeight = (fullSolidWeight * 0.75) * infillPercentage;
  
  // %15 Destek (Support) Payı (Görseldeki yeşil alanlar için kritik)
  const realWeight = (shellWeight + internalWeight) * 1.15;

  // 2. KOBRA 2 PLUS PARAMETRELERİ
  const config = {
    materialGramPrice: { pla: 0.95, petg: 1.25, abs: 1.50 },
    hourlyRate: 60, 
    // Makine hızı: Saatte 40 gram (Kobra 2 Plus için gerçekçi değer)
    avgSpeedGramPerHour: 40, 
    minPrice: 50 
  };

  // 3. SÜRE HESABI (Yüksek Hız Odaklı)
  const resMult = options.resolution === 0.1 ? 1.4 : 1.0;
  
  // Süre artık sadece toplam ağırlığın yüksek hıza bölünmesidir
  let estimatedHours = (realWeight / config.avgSpeedGramPerHour) * resMult;
  estimatedHours = Math.max(estimatedHours, 0.4); // Min 24 dk (Isınma dahil)

  // 4. FİYAT HESABI
  const baseMatPrice = config.materialGramPrice[options.material as keyof typeof config.materialGramPrice] || 0.95;
  const dynamicMatPrice = baseMatPrice * options.multiplier;

  const materialCost = realWeight * dynamicMatPrice;
  const laborCost = estimatedHours * config.hourlyRate;
  
  const zRisk = stats.y > 200 ? 1 + ((stats.y - 200) / 500) : 1;
  let totalPrice = (materialCost + laborCost) * zRisk;
  totalPrice = Math.max(totalPrice, config.minPrice);

  // Formatlı süre (Örn: 1 Saat 30 Dakika)
  const h = Math.floor(estimatedHours);
  const m = Math.round((estimatedHours - h) * 60);
  const formattedTime = h > 0 ? `${h} Saat ${m} Dakika` : `${m} Dakika`;

  return {
    weight: realWeight,
    hours: estimatedHours,
    formattedTime,
    price: Math.ceil(totalPrice)
  };
}, [stats, options]);

// --- MODEL DÖNDÜRME (POZİSYON KORUMALI) ---
const rotateModel = (axis: 'x' | 'y' | 'z') => {
  if (!geometry || !stats) return;

  // 1. Geometriyi klonla (Orijinal veriyi bozmamak için)
  const newGeom = geometry.clone();
  const angle = Math.PI / 2; // 90 derece

  // 2. Eksene göre döndür
  if (axis === 'x') newGeom.rotateX(angle);
  if (axis === 'y') newGeom.rotateY(angle);
  if (axis === 'z') newGeom.rotateZ(angle);

  // 3. Yeni sınırları hesapla
  newGeom.computeBoundingBox();
  
  // 4. Modeli tekrar (0,0,0) merkezine çek
  // Bu, ModelViewer'daki tabana oturtma mantığının sapmamasını sağlar.
  newGeom.center();

  const size = new THREE.Vector3();
  newGeom.boundingBox!.getSize(size);

  // 5. İstatistikleri güncelle 
  // DİKKAT: weight (ağırlık) sabit kalmalı, sadece boyutlar güncellenmeli.
  setStats({ 
    ...stats, 
    x: size.x, 
    y: size.y, 
    z: size.z 
  });

  // 6. Yeni geometriyi state'e bas
  setGeometry(newGeom);
};

// --- STL ANALİZ VE YÜKLEME ---
// --- STL ANALİZ VE YÜKLEME ---
const onDrop = useCallback((acceptedFiles: File[]) => {
  const file = acceptedFiles[0];
  if (!file) return;
  
  if (file.size > 50 * 1024 * 1024) {
    alert("Dosya boyutu çok yüksek (Max 50MB).");
    return;
  }

  setFileName(file.name);
  setLoading(true);
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const loader = new STLLoader();
      const buffer = e.target?.result as ArrayBuffer;
      const geom = loader.parse(buffer);
      
      geom.computeBoundingBox();
      geom.center();
      
      const size = new THREE.Vector3();
      geom.boundingBox!.getSize(size);
      
      let vol = 0;
      const pos = geom.attributes.position;
      const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3();

      for (let i = 0; i < pos.count; i += 3) {
        v1.fromBufferAttribute(pos, i);
        v2.fromBufferAttribute(pos, i + 1);
        v3.fromBufferAttribute(pos, i + 2);
        vol += v1.dot(v2.cross(v3)) / 6.0;
      }

      // Sadece ham hacmi gönder, ağırlık hesabını useMemo'ya bırak
      setStats({ 
        volume: Math.abs(vol), // mm3 cinsinden hacim
        x: size.x, 
        y: size.y, 
        z: size.z 
      });
      
      setGeometry(geom);
    } catch (err) { 
      alert("STL analizi hatası."); 
    } finally { 
      setLoading(false); 
    }
  };
  reader.readAsArrayBuffer(file);
}, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'] }, multiple: false });

  const currentMaterialColors = useMemo(() => {
    return dbFilaments.filter(f => f.material === options.material);
  }, [dbFilaments, options.material]);


  const formatDuration = (hours: number) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  
  if (h === 0) return `${m} Dakika`;
  if (m === 0) return `${h} Saat`;
  return `${h} Saat ${m} Dakika`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* SOL: 3D GÖRÜNÜM */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 order-1">
          <div className="relative group overflow-hidden rounded-[4rem] bg-slate-100 border border-slate-200 shadow-inner">
            <ModelViewer geometry={geometry} color={options.colorHex} />
            
            {/* Model Dosya Adı Etiketi */}
            {geometry && fileName && (
              <div className="absolute bottom-8 left-8 pointer-events-none animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-slate-900/90 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className="text-blue-400">📦</span> {fileName}
                  </p>
                </div>
              </div>
            )}

            {/* Yükleme Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-md z-50">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-14 w-14 border-[6px] border-blue-600 border-t-transparent shadow-xl"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 animate-pulse">Analiz Ediliyor</span>
                </div>
              </div>
            )}
          </div>
          
          {/* ALT PANEL: Ölçüler ve Kontroller */}
          {geometry && stats && (
            <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">

              {/* 2. SATIR: İşlem Butonları */}
              <div className="p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
                <div className="flex gap-2 w-full sm:w-auto">
                  {(['x', 'y', 'z'] as const).map(axis => (
                    <button 
                      key={axis} 
                      onClick={() => rotateModel(axis)} 
                      className="flex-1 sm:flex-none px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 group"
                    >
                      <span className="text-slate-400 group-hover:text-blue-400 mr-1 transition-colors">{axis.toUpperCase()}</span> ÇEVİR
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={() => { setGeometry(null); setFileName(""); setStats(null); }} 
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-6 py-3 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all flex items-center gap-2 group"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">🗑️</span>
                  MODELİ KALDIR
                </button>
              </div>
              
              {/* 1. SATIR: Teknik Ölçü Kartları */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'GENİŞLİK (X)', val: stats.x, color: 'bg-red-500', shadow: 'shadow-red-200' },
                  { label: 'YÜKSEKLİK (Y)', val: stats.y, color: 'bg-green-500', shadow: 'shadow-green-200' },
                  { label: 'DERİNLİK (Z)', val: stats.z, color: 'bg-blue-600', shadow: 'shadow-blue-200' }
                ].map((item) => (
                  <div key={item.label} className="bg-white border border-slate-200 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all group/card">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${item.color} ${item.shadow} shadow-lg`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 tracking-tighter group-hover/card:text-blue-600 transition-colors">
                        {item.val.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-slate-300 uppercase">mm</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* SAĞ: KONTROLLER */}
        <div className="lg:col-span-5 space-y-6 lg:space-y-8 order-2">
          {!geometry ? (
            <div {...getRootProps()} className={`min-h-[400px] lg:h-[550px] border-4 border-dashed rounded-[4rem] flex flex-col items-center justify-center p-8 transition-all cursor-pointer ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400'}`}>
              <input {...getInputProps()} />
              <div className="text-7xl mb-6 drop-shadow-lg">☁️</div>
              <h2 className="text-xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 text-center leading-tight">
                STL DOSYASINI<br/><span className="text-blue-600 text-4xl lg:text-6xl tracking-normal font-black">YÜKLE</span>
              </h2>
              <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Dosyayı buraya sürükleyin veya tıklayın</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="bg-slate-50 p-6 lg:p-10 rounded-[3rem] border border-slate-200 space-y-8 shadow-sm">
                {/* Malzeme Seçimi - handleMaterialChange (Stok Kontrollü) */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">
                    Üretim Malzemesi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pla', 'petg', 'abs'].map(m => {
                      // Veritabanında bu malzemeye ait aktif bir kayıt var mı?
                      const isAvailable = dbFilaments.some(f => f.material.toLowerCase() === m);
                      const isSelected = options.material === m;

                      return (
                        <button 
                          key={m} 
                          disabled={!isAvailable} // Stokta yoksa butonu devre dışı bırak
                          onClick={() => handleMaterialChange(m)}
                          className={`
                            py-4 rounded-2xl font-black text-[10px] uppercase transition-all relative
                            ${isSelected 
                              ? 'bg-slate-900 text-white shadow-xl scale-105 z-10' 
                              : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'}
                            ${!isAvailable ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}
                          `}
                        >
                          {m}
                          {!isAvailable && (
                            <span className="absolute -top-1 -right-1 text-[8px] bg-red-500 text-white px-1 rounded-md">
                              YOK
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Doluluk */}
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-4"><span>İç Doluluk</span> <span className="text-blue-600">%{options.infill}</span></div>
                  <input type="range" min="10" max="100" step="10" value={options.infill} onChange={e => setOptions({...options, infill: parseInt(e.target.value)})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>

                {/* Hassasiyet */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 text-center sm:text-left">Katman Hassasiyeti</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[0.1, 0.2].map(r => (
                      <button key={r} onClick={() => setOptions({...options, resolution: r})} className={`py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${options.resolution === r ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'}`}>
                        {r === 0.1 ? '⭐ Hassas (0.1mm)' : 'Standart (0.2mm)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Renk (Dinamik) */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Renk Seçimi</label>
                  <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                    {currentMaterialColors.map(c => (
                      <button 
                        key={c.id} 
                        title={c.color_name} 
                        onClick={() => setOptions({
                          ...options, 
                          color: c.color_name, 
                          colorHex: c.color_hex, 
                          multiplier: c.price_multiplier 
                        })} 
                        className={`w-12 h-12 rounded-full border-4 transition-all hover:scale-110 active:scale-90 ${options.color === c.color_name ? 'border-blue-600 shadow-lg scale-110' : 'border-white'}`} 
                        style={{ backgroundColor: c.color_hex }} 
                      />
                    ))}
                    {!dbLoading && currentMaterialColors.length === 0 && (
                      <p className="text-[10px] font-bold text-orange-500 uppercase">Bu malzemede aktif stok bulunmuyor.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* FİYAT KARTI (REVİZE EDİLDİ) */}
              <div className="bg-blue-600 p-8 lg:p-12 rounded-[3.5rem] text-white shadow-[0_35px_60px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="grid grid-cols-2 gap-4 opacity-80 mb-8 border-b border-white/20 pb-8 text-[10px] font-bold uppercase tracking-widest">
                    <div className="space-y-1">
                      <p className="text-blue-200">Tahmini Ağırlık</p>
                      <p className="text-base text-white">{calculatedData.weight.toFixed(1)} gr</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-blue-200">Tahmini Süre</p>
                      <p className="text-base text-white">{formatDuration(calculatedData.hours)}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black tracking-[0.4em] opacity-60 uppercase block mb-4">Sipariş Bedeli</span>
                  <div className="text-6xl lg:text-7xl font-black italic tracking-tighter mb-10 leading-none">
                    {calculatedData.price} <span className="text-2xl not-italic ml-1 text-blue-200">TL</span>
                  </div>
                  <button 
                    onClick={() => {
                      const message = encodeURIComponent(
                        `*YENİ 3D BASKI SİPARİŞİ*\n` +
                        `----------------------------------\n` +
                        `*Dosya:* ${fileName}\n` +
                        `*Malzeme:* ${options.material.toUpperCase()}\n` +
                        `*Renk:* ${options.color} (${options.colorHex})\n` +
                        `----------------------------------\n` +
                        `*TEKNİK DETAYLAR*\n` +
                        `• *Hassasiyet:* ${options.resolution}mm\n` +
                        `• *İç Doluluk:* %${options.infill}\n` +
                        `• *Hesaplanan Ağırlık:* ~${calculatedData.weight.toFixed(1)} gr\n` +
                        `• *Boyutlar (X,Y,Z):* ${stats?.x.toFixed(1)} x ${stats?.y.toFixed(1)} x ${stats?.z.toFixed(1)} mm\n` +
                        `----------------------------------\n` +
                        `*TEKLİF TUTARI:* *${calculatedData.price} TL*\n` +
                        `----------------------------------\n` +
                        `_Memonex3D Analiz Motoru ile oluşturulmuştur._`
                      );
                      window.open(`https://wa.me/905312084897?text=${message}`, '_blank');
                    }} 
                    className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white hover:text-blue-600 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                  >
                    <span>SİPARİŞİ ONAYLA</span>
                    <span className="text-xl">🚀</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}