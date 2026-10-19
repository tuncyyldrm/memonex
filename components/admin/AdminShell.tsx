"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/admin/LogoutButton";

interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  id: string;
  exact?: boolean;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊", id: "dashboard", exact: true },
  { label: "Sayfa Yönetimi", href: "/admin/pages", icon: "📄", id: "pages" },
  { label: "Blog Yönetimi", href: "/admin/blog", icon: "📝", id: "blog" },
  { label: "Ürün Kataloğu", href: "/admin/products", icon: "📦", id: "products" },
  { label: "Filamentler", href: "/admin/filament", icon: "🧵", id: "filament" },
  { label: "Genel Ayarlar", href: "/admin/settings", icon: "⚙️", id: "settings" },
];

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  avatarLabel: string;
}

export default function AdminShell({
  children,
  userEmail,
  userName,
  avatarLabel,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mobil menü açıkken arkadaki sayfanın kaymasını engelle
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const renderNavLinks = () => (
    <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-2">
      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all group font-bold text-xs uppercase tracking-wider ${
              isActive
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-black"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span
              className={`text-lg transition-transform group-hover:scale-110 ${
                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
              }`}
            >
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarFooter = () => (
    <div className="p-4 sm:p-6 border-t border-white/5 bg-black/25">
      <div className="space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all text-xs font-bold uppercase tracking-wider"
        >
          <span>🏠</span>
          <span>Siteyi Görüntüle</span>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] antialiased text-slate-900 flex flex-col">
      {/* 1. MOBİL BACKDROP OVERLAY */}
      {mobileMenuOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Menüyü Kapat"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setMobileMenuOpen(false);
          }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* 2. MOBİL SİDEBAR ÇEKMECESİ (DRAWER) */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0F172A] text-slate-400 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-lg">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tighter text-white uppercase">
                MEMONEX<span className="text-blue-500 italic">3D</span>
              </span>
              <span className="text-[8px] font-bold tracking-[0.25em] text-blue-400 uppercase">
                Admin Panel
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Menüyü Kapat"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {renderNavLinks()}
        {renderSidebarFooter()}
      </aside>

      {/* 3. MASAÜSTÜ SABİT SİDEBAR */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-72 bg-[#0F172A] text-slate-400 flex-col z-40 shadow-2xl">
        <div className="p-8 mb-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-all shadow-lg shadow-blue-500/20 text-lg">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter text-white leading-none uppercase">
                MEMONEX<span className="text-blue-500 italic">3D</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-blue-400 uppercase mt-1">
                Control Center
              </span>
            </div>
          </Link>
        </div>

        {renderNavLinks()}
        {renderSidebarFooter()}
      </aside>

      {/* 4. ANA İÇERİK ALANI */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* ÜST BİLGİ VE HEADER ÇUBUĞU */}
        <header className="h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobil Hamburger Butonu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Menüyü Aç"
              className="lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-100 active:scale-95 transition-all focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Hoş Geldin / Durum */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Sistem Aktif
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 uppercase tracking-tight italic truncate max-w-[160px] sm:max-w-none">
                {userName ? (
                  <>
                    Hoş Geldin, <span className="text-blue-600">{userName}</span>
                  </>
                ) : (
                  "Yönetici Paneli"
                )}
              </h1>
            </div>
          </div>

          {/* Sağ Kullanıcı Profili */}
          <div className="flex items-center gap-3 sm:gap-6">
            {userEmail && (
              <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-5">
                <span className="text-[10px] font-black text-slate-900 leading-none mb-1 lowercase truncate max-w-[200px]">
                  {userEmail}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter italic">
                  Erişim: Yönetici
                </span>
              </div>
            )}
            <div
              className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-slate-900 to-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center text-[10px] sm:text-[11px] font-black text-white shadow-lg shadow-slate-900/10 flex-shrink-0"
              title={userEmail}
            >
              {avatarLabel || "AD"}
            </div>
          </div>
        </header>

        {/* SAYFA İÇERİĞİ KAPSAYICISI */}
        <main className="p-3 sm:p-6 lg:p-8 flex-1 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl sm:rounded-3xl lg:rounded-[3rem] border border-slate-200/60 shadow-sm p-4 sm:p-6 lg:p-10 min-h-[calc(100vh-100px)] sm:min-h-[calc(100vh-140px)] relative overflow-hidden flex-1 flex flex-col">
            <div className="relative z-10 w-full min-w-0 flex-1 flex flex-col">{children}</div>
            <div className="absolute -bottom-10 -right-10 opacity-[0.02] pointer-events-none text-[10rem] sm:text-[15rem] font-black italic select-none uppercase">
              M3D
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
