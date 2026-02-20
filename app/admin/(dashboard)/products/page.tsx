'use client';

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 1. Veritabanı sütun isimlerine göre arayüzü güncelledik
interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  created_at: string;
  image?: string; // Veritabanındaki sütun ismin 'image' ise bu çalışır
}

export default function AdminProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    // Veritabanından tüm sütunları çekiyoruz
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Veri çekme hatası:", error.message);
    }
    
    if (data) setProducts(data);
    setLoading(false);
  }

  // SİLME FONKSİYONU
  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz?`)) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Silme işlemi başarısız: " + error.message);
    } else {
      // Sayfayı yenilemeden listeyi güncelle
      setProducts(products.filter(p => p.id !== id));
      router.refresh();
    }
  }

  if (loading) return (
    <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-[0.3em]">
      Envanter Yükleniyor...
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Üst Bar */}
      <div className="flex justify-between items-end border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
            ENVANTER YÖNETİMİ
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
            Toplam {products.length} Ürün Listeleniyor
          </p>
        </div>
        <Link 
          href="/admin/products/new" 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          + YENİ ÜRÜN EKLE
        </Link>
      </div>

      {/* Ürün Tablosu */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ürün Detayı</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fiyat</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Durum</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Geliştirilmiş Görsel Önizleme */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-inner">
                         {product.image ? (
                           <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            onError={(e) => {
                                // Resim linki bozuksa gösterilecek simge
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                           />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px] font-black uppercase text-center p-2 leading-tight">
                             Görsel Yok
                           </div>
                         )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                          {product.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">
                          SKU-{product.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl">
                      {Number(product.price).toLocaleString('tr-TR')} TL
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      STOKTA VAR
                    </span>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <Link 
                      href={`/admin/products/${product.id}`} 
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                      title="Düzenle"
                    >
                      ✎
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id, product.name)}
                      className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-50 text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Sil"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 italic font-medium">Henüz envantere ürün eklenmemiş.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}