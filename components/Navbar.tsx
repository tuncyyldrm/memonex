"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  settings: {
    whatsapp_no?: string;
    brand_name?: string;
    brand_suffix?: string;
    address_city?: string;
  } | null;
}

export default function Navbar({ settings }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const brand = settings?.brand_name || "MEMONEX";
  const suffix = settings?.brand_suffix || "3D";
  const whatsapp = settings?.whatsapp_no || "905312084897";
  const city = settings?.address_city || "Isparta, Türkiye";

  // Scroll Takibi
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Erişilebilirlik: ESC ile Menü Kapatma & Pencere Değişimi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 768) setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
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
      className={`fixed top-0 left-0 right-0 z-[10002] w-full transition-all duration-500 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] py-0" 
          : "bg-white border-b border-transparent py-2"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="group flex items-center gap-1 z-[10005] outline-none" 
          onClick={() => setIsOpen(false)}
        >
          <span className="font-black text-2xl tracking-tighter uppercase text-slate-900 flex items-center">
            {brand}
            <span className="text-blue-600 italic group-hover:not-italic transition-all duration-500 ml-0.5">
              {suffix}
            </span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8 mr-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-blue-600 relative group/link ${
                  pathname === link.href ? "text-blue-600" : "text-slate-500"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                  pathname === link.href ? "w-full" : "w-0 group-hover/link:w-full"
                }`} />
              </Link>
            ))}
          </div>
          
          <Link 
            href={`/hizli-teklif`} 
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-blue-600/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            HIZLI TEKLİF
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden z-[10005] p-2 -mr-2 text-slate-900 rounded-lg active:bg-slate-100 transition-colors"
          aria-expanded={isOpen}
        >
          <div className="w-6 h-5 flex flex-col justify-between items-end">
            <span className={`h-0.5 bg-slate-900 transition-all duration-300 origin-right ${isOpen ? 'w-6 -rotate-45 translate-y-[1px]' : 'w-6'}`}></span>
            <span className={`h-0.5 bg-slate-900 transition-all duration-300 ${isOpen ? 'opacity-0 translate-x-2' : 'w-4'}`}></span>
            <span className={`h-0.5 bg-slate-900 transition-all duration-300 origin-right ${isOpen ? 'w-6 rotate-45 -translate-y-[1px]' : 'w-5'}`}></span>
          </div>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div 
        className={`fixed inset-0 h-screen w-full bg-white z-[10003] md:hidden transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <div className={`flex flex-col h-full px-10 pt-22 pb-12 transition-transform duration-500 ${isOpen ? 'translate-y-0' : 'translate-y-10'}`}>
          <div className="flex flex-col gap-8">            
            {navLinks.map((link, idx) => (
              <Link 
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: `${idx * 50}ms` }}
                className={`text-2xl font-black uppercase tracking-tighter transition-all flex items-center justify-between group ${
                  pathname === link.href ? 'text-blue-600 translate-x-2' : 'text-slate-900 hover:translate-x-2'
                }`}
              >
                {link.name}
                <span className={`w-3 h-3 rounded-full bg-blue-600 transition-all duration-500 ${
                  pathname === link.href ? 'opacity-100 scale-100' : 'opacity-0 scale-0 group-hover:opacity-50 group-hover:scale-100'
                }`} />
              </Link>
            ))}
          </div>

          <div className="mt-10 border-t border-slate-20 pt-5 flex flex-col gap-4">   
            <Link 
              href={`/hizli-teklif`} 
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="group relative flex items-center justify-center bg-blue-600 text-white w-full py-5 rounded-2xl text-center text-sm font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 overflow-hidden active:scale-[0.98] transition-all"
            >
              <span className="relative z-10">HIZLI TEKLİF</span>
              <div className="absolute inset-0 bg-slate-900 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konum</p>
                <p className="text-slate-900 font-bold text-sm uppercase">{city}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destek</p>
                <p className="text-slate-900 font-bold text-sm uppercase">7/24 Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}