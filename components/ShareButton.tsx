"use client"; // Bu butonun tarayıcıda çalışacağını belirtir.

export default function ShareButton({ title }: { title: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Linki kopyala veya sadece mesaj göster
      navigator.clipboard.writeText(window.location.href);
      alert("Link kopyalandı!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full sm:flex-1 bg-white text-slate-900 py-5 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] border-2 border-slate-100 hover:bg-slate-50 transition-all"
    >
      PAYLAŞ
    </button>
  );
}