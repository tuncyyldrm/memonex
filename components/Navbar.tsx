"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menü açıldığında sayfanın arkada kaymasını tamamen engeller
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // Mobil kaydırmayı kilitler
    } else {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Katalog", href: "/products" },
    { name: "Satış & Mağaza", href: "/satis-ve-magaza" },
    { name: "Blog", href: "/blog" },
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "İletişim", href: "/iletisim" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[10002] w-full transition-all duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm" : "bg-white border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative" aria-label="Ana Navigasyon">
        
        {/* LOGO - Z-Index artırıldı */}
        <Link 
          href="/" 
          className="group flex items-center gap-1 z-[10005]" 
          onClick={() => setIsOpen(false)}
        >
          <span className="font-black text-2xl tracking-tighter uppercase text-slate-900">
            MEMONEX<span className="text-blue-600 italic group-hover:not-italic transition-all duration-500">3D</span>
          </span>
        </Link>

        {/* MASAÜSTÜ MENÜ */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600 ${
                pathname === link.href ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href="https://wa.me/905312084897" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-7 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all hover:scale-105 active:scale-95"
          >
            TEKLİF AL
          </Link>
        </div>

        {/* MOBİL BUTON - Menü açıldığında en üstte durur */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden z-[10005] p-2 text-slate-900 focus:outline-none"
          aria-label={isOpen ? "Menüyü Kapat" : "Menüyü Aç"}
        >
          <div className="w-6 h-5 flex flex-col justify-between items-end">
            <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 translate-y-2.5 -rotate-45' : 'w-6'}`}></span>
            <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'w-4'}`}></span>
            <span className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-6 -translate-y-2 rotate-45' : 'w-5'}`}></span>
          </div>
        </button>
      </nav>

      {/* MOBİL OVERLAY - TAM EKRAN VE TAM OPAK ARKA PLAN */}
      <div 
        className={`fixed inset-0 h-screen w-full bg-white z-[10003] flex flex-col transition-transform duration-500 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-10 pt-16 pb-12 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <span className="text-[10px] font-black tracking-[0.4em] text-blue-600 uppercase opacity-50 mb-4">Navigasyon</span>
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-4xl font-black uppercase tracking-tighter transition-colors flex items-center justify-between ${
                  pathname === link.href ? 'text-blue-600' : 'text-slate-900'
                }`}
              >
                {link.name}
                {pathname === link.href && <span className="w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" />}
              </Link>
            ))}
          </div>

          <div className="mt-auto border-t border-slate-100 pt-8 space-y-8">
            <div className="space-y-2">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">İletişim</p>
               <p className="text-slate-900 font-bold uppercase">Isparta, Türkiye</p>
            </div>
            <Link 
              href="https://wa.me/905312084897" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block bg-blue-600 text-white w-full py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-transform"
            >
              HIZLI TEKLİF AL
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}