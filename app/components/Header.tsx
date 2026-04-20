"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCartCount();

    // Listen for changes
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="text-xl font-bold cursor-pointer text-white hover:text-cyan-400 transition">
            TOKO FASHION
          </div>
        </Link>

        <nav className="hidden md:flex gap-8">
          <Link
            href="/"
            className={`text-sm font-semibold transition ${pathname === "/" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}
          >
            Beranda
          </Link>
          <Link
            href="/admin"
            className={`text-sm font-semibold transition ${pathname === "/admin" ? "text-cyan-400" : "text-slate-400 hover:text-white"}`}
          >
            Admin
          </Link>
        </nav>

        <Link href="/cart">
          <button className="relative rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:text-cyan-400">
            Keranjang
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </Link>
      </div>
    </header>
  );
}
