'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import ModelViewer from './ModelViewer';
import { supabase } from '@/lib/supabase';

interface Filament {
  id: string;
  material: string;
  color_name: string;
  color_hex: string;
  price_multiplier: number;
}

interface Stats {
  weight: number; // Bu değer STL'den gelen %100 dolu (solid) ham ağırlıktır
  x: number;
  y: number;
  z: number;
}

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

  // --- VERİTABANI BAĞLANTISI ---
  useEffect(() => {
    const fetchFilaments = async () => {
      try {
        const { data, error } = await supabase
          .from('filaments')
          .select('*')
          .eq('is_active', true);

        if (!error && data) {
          setDbFilaments(data);
          const defaultFilament = data.find(f => f.material === 'pla') || data[0];
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
        console.error("Filamentler yüklenirken hata:", err);
      } finally {
        setDbLoading(false);
      }
    };
    fetchFilaments();
  }, []);

  // --- GELİŞMİŞ HESAPLAMA MOTORU (REVİZE EDİLDİ) ---
  const calculatedData = useMemo(() => {
    if (!stats) return { weight: 0, hours: 0, price: 0 };

    // 1. Dinamik Ağırlık Hesabı:
    // Modelin %25'i duvar (shell) kabul edilir (sabit), geri kalan %75'i infill oranına göre değişir.
    const infillRatio = options.infill / 100;
    const shellWeight = stats.weight * 0.7; 
    const internalWeight = stats.weight * 0.3 * infillRatio;
    const realWeight = shellWeight + internalWeight;

    // 2. Süre Hesabı:
    // Gramaj arttıkça süre artar. Ayrıca çözünürlük (0.1mm) süreyi yaklaşık 2.1 kat artırır.
    const config = {
      materialGramPrice: { pla: 0.8, petg: 1.0, abs: 1.2 }, 
      hourlyRate: 63, 
      avgSpeedGramPerHour: 18 
    };

    const resMult = options.resolution === 0.1 ? 2.1 : 1.0;
    let estimatedHours = (realWeight / config.avgSpeedGramPerHour) * resMult;
    estimatedHours = Math.max(estimatedHours, 0.3);

    // 3. Fiyat Hesabı:
    const baseMatPrice = config.materialGramPrice[options.material as keyof typeof config.materialGramPrice] || 0.8;
    const dynamicMatPrice = baseMatPrice * options.multiplier;

    const materialCost = realWeight * dynamicMatPrice;
    const laborAndTimeCost = estimatedHours * config.hourlyRate;
    
    const zRisk = stats.y > 100 ? 1 + ((stats.y - 100) / 500) : 1;

    let totalPrice = (materialCost + laborAndTimeCost) * zRisk;
    
    return {
      weight: realWeight,
      hours: estimatedHours,
      price: Math.ceil(totalPrice)
    };
  }, [stats, options]);

  // --- MODEL DÖNDÜRME ---
  const rotateModel = (axis: 'x' | 'y' | 'z') => {
    if (!geometry || !stats) return;
    const newGeom = geometry.clone();
    if (axis === 'x') newGeom.rotateX(Math.PI / 2);
    if (axis === 'y') newGeom.rotateY(Math.PI / 2);
    if (axis === 'z') newGeom.rotateZ(Math.PI / 2);
    newGeom.computeBoundingBox();
    newGeom.center();
    const size = new THREE.Vector3();
    newGeom.boundingBox!.getSize(size);
    setStats({ ...stats, x: size.x, y: size.y, z: size.z });
    setGeometry(newGeom);
  };

  // --- STL ANALİZ VE YÜKLEME ---
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const loader = new STLLoader();
        const geom = loader.parse(e.target?.result as ArrayBuffer);
        geom.computeBoundingBox();
        geom.center();
        const size = new THREE.Vector3();
        geom.boundingBox!.getSize(size);
        let vol = 0;
        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count / 3; i++) {
          const v1 = new THREE.Vector3(pos.getX(i*3), pos.getY(i*3), pos.getZ(i*3));
          const v2 = new THREE.Vector3(pos.getX(i*3+1), pos.getY(i*3+1), pos.getZ(i*3+1));
          const v3 = new THREE.Vector3(pos.getX(i*3+2), pos.getY(i*3+2), pos.getZ(i*3+2));
          vol += v1.dot(v2.cross(v3)) / 6.0;
        }
        // Ham solid ağırlığı hesapla (Özgül ağırlık ~1.25)
        setStats({ weight: (Math.abs(vol) / 1000) * 1.25, x: size.x, y: size.y, z: size.z });
        setGeometry(geom);
      } catch (err) { alert("Dosya okunamadı."); }
      finally { setLoading(false); }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'model/stl': ['.stl'] }, multiple: false });

  const currentMaterialColors = useMemo(() => {
    return dbFilaments.filter(f => f.material === options.material);
  }, [dbFilaments, options.material]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        
        {/* SOL: 3D GÖRÜNÜM */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 order-1">
          <div className="relative group overflow-hidden rounded-[3rem] bg-slate-100 border border-slate-200 shadow-inner">
            <ModelViewer geometry={geometry} color={options.colorHex} />
            {geometry && fileName && (
              <div className="absolute bottom-6 left-6 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[150px]">📦 {fileName}</p>
                </div>
              </div>
            )}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {geometry && (
            <div className="mt-6 p-4 sm:p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex gap-2 w-full sm:w-auto">
                {(['x', 'y', 'z'] as const).map(axis => (
                  <button key={axis} onClick={() => rotateModel(axis)} className="flex-1 sm:flex-none px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
                    {axis.toUpperCase()} ÇEVİR
                  </button>
                ))}
              </div>
              <button onClick={() => { setGeometry(null); setFileName(""); setStats(null); }} className="text-[10px] font-black text-red-500 uppercase tracking-widest p-2 hover:bg-red-50 rounded-lg transition-colors">MODELİ SİL</button>
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
                {/* Malzeme */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Üretim Malzemesi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['pla', 'petg', 'abs'].map(m => (
                      <button key={m} onClick={() => {
                        const firstMatch = dbFilaments.find(f => f.material === m);
                        setOptions({
                          ...options, 
                          material: m, 
                          color: firstMatch?.color_name || '', 
                          colorHex: firstMatch?.color_hex || '#ccc',
                          multiplier: firstMatch?.price_multiplier || 1.0
                        });
                      }} 
                      className={`py-4 rounded-2xl font-black text-[10px] uppercase transition-all ${options.material === m ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'}`}>{m}</button>
                    ))}
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
                      <p className="text-base text-white">{calculatedData.hours.toFixed(1)} Saat</p>
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