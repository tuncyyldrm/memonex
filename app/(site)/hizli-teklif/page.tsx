import Calculator from "@/components/Calculator";

export default function QuickQuotePage() {
  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <header className="max-w-4xl mb-16">
          <h1 className="text-2xl md:text-[5rem] font-black text-slate-900 tracking-[ -0.05em] leading-[0.75] uppercase italic mb-12">
            HIZLI <br/> <span className="text-blue-600">ÜRETİM.</span>
          </h1>
          <p className="text-1xl text-slate-400 font-bold max-w-2xl italic leading-relaxed">
            Memonex 3D motoruyla modelini saniyeler içinde analiz et, fiyatını belirle ve Isparta atölyemizde üretimi başlat.
          </p>
        </header>

        <Calculator />
      </div>
    </div>
  );
}