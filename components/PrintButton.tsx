"use client";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="text-slate-900 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
    >
      Sayfayı Yazdır ↓
    </button>
  );
}