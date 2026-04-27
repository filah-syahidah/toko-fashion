"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartItems(cart);
    setLoading(false);
  }, []);

  const updateQuantity = (id: string, quantity: number) => {
    const updated = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const clearCart = () => {
    if (confirm("Hapus semua item dari keranjang?")) {
      setCartItems([]);
      localStorage.setItem("cart", JSON.stringify([]));
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <p className="text-slate-400 text-lg">Memuat keranjang...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.22),_transparent_35%)]" />

          <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6">
            <div className="w-full max-w-md sm:max-w-lg space-y-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl sm:text-7xl font-light text-slate-600">[ ]</div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Keranjang Belanja Kosong</h1>
                <p className="text-base sm:text-lg text-slate-400 px-4">Tidak ada item di keranjang Anda. Mulai belanja sekarang untuk menemukan produk fashion pilihan Anda.</p>
              </div>

              <Link href="/">
                <button className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-5 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01] min-h-[56px] flex items-center justify-center">
                  Lanjutkan Belanja
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.22),_transparent_35%)]" />

        <div className="relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <div className="mb-8 sm:mb-10 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Keranjang Belanja</h1>
              <p className="text-slate-400 text-base">Anda memiliki {totalItems} item dalam keranjang</p>
            </div>

            <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group overflow-visible rounded-3xl border border-slate-800/90 bg-slate-900/80 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:gap-6">
                      {/* Image */}
                      {item.image && (
                        <div className="relative w-full sm:w-32 h-28 sm:h-32 flex-shrink-0 mb-4 sm:mb-0 mx-auto sm:mx-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full rounded-2xl object-cover shadow-lg transition-all duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                        {/* Product Info */}
                        <Link href={`/products/${item.id}`} className="block">
                          <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2 transition hover:text-cyan-400">
                            {item.name}
                          </h3>
                        </Link>
                        
                        <p className="text-xl sm:text-2xl font-bold text-white">
                          Rp {item.price?.toLocaleString("id-ID")}
                        </p>

                        {/* Quantity Controls - Mobile Optimized */}
                        <div className="flex items-stretch gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex-1 min-h-[48px] rounded-2xl border-2 border-slate-700/80 bg-slate-950/80 font-bold text-lg text-white transition-all hover:border-cyan-400 hover:bg-slate-900/50 active:scale-[0.98]"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 min-h-[48px] rounded-2xl border-2 border-slate-700/80 bg-slate-950/70 px-4 py-2 text-center text-lg font-bold text-white outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex-1 min-h-[48px] rounded-2xl border-2 border-slate-700/80 bg-slate-950/80 font-bold text-lg text-white transition-all hover:border-cyan-400 hover:bg-slate-900/50 active:scale-[0.98]"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price & Delete - Mobile Stacked */}
                      <div className="flex flex-col sm:flex-col-reverse sm:items-end sm:justify-between pt-2 sm:pt-0 gap-3 sm:gap-0">
                        <div className="text-right sm:text-left">
                          <p className="text-sm text-slate-400 mb-1">Subtotal</p>
                          <p className="text-xl sm:text-2xl font-bold text-white">
                            Rp {(item.price * item.quantity)?.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-full sm:w-auto min-h-[44px] rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-sm sm:text-base font-semibold text-rose-200 transition-all active:scale-[0.98] flex items-center justify-center"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full min-h-[52px] rounded-3xl border-2 border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-6 py-3 font-semibold text-rose-200 text-lg transition-all active:scale-[0.98]"
                  >
                    Kosongkan Semua Item ({cartItems.length})
                  </button>
                )}
              </div>

              {/* Summary - Always Full Width on Mobile */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 lg:top-24 rounded-3xl border border-white/10 bg-slate-900/80 p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
                  <h2 className="mb-6 text-xl sm:text-2xl font-bold text-white">Ringkasan Pesanan</h2>

                  <div className="space-y-4 mb-8 border-t border-white/10 pt-6">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-sm sm:text-base">Subtotal ({totalItems} item)</span>
                      <span className="font-semibold text-white text-base">
                        Rp {totalPrice?.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-sm sm:text-base">Ongkir</span>
                      <span className="text-xs sm:text-sm text-slate-500">Dihitung saat checkout</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4 sm:p-6 mb-6 lg:mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-semibold text-slate-400">Total</span>
                      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Rp {totalPrice?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full min-h-[56px] rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-bold text-slate-950 text-lg shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] mb-4"
                  >
                    Lanjut ke Checkout
                  </button>

                  <Link href="/" className="block">
                    <button className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/80 px-6 py-3 font-semibold text-slate-100 text-base transition-all hover:border-cyan-400 hover:bg-slate-900/50 active:scale-[0.98]">
                      Lanjutkan Belanja
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}