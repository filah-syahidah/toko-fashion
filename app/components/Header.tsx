"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  const navItems = [
    { href: "/", label: "Beranda" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

        {/* 🔥 LOGO */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group">
            <img
              src="/logo-remove.png"
              alt="logo"
              className="h-14 md:h-16 w-auto object-contain"
            />
          </div>
        </Link>

        {/* 🔥 NAV DESKTOP */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition ${
                pathname === item.href
                  ? "text-cyan-400"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
              {pathname === item.href && (
                <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-cyan-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </nav>

        {/* 🔥 RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* 🔥 TOGGLE MENU (MOBILE) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white"
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>

          {/* 🔥 CART */}
          <Link href="/cart">
            <button className="relative flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-white hover:border-cyan-400 transition">

              <ShoppingCartIcon className="h-5 w-5 md:h-6 md:w-6" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </Link>

        </div>
      </div>

      {/* 🔥 MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-xl">
          <div className="flex flex-col items-center py-6 space-y-6">

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`text-base font-semibold ${
                  pathname === item.href
                    ? "text-cyan-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}

          </div>
        </div>
      )}

    </header>
  );
}