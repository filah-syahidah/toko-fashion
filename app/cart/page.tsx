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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Memuat keranjang...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.22),_transparent_35%)]" />

          <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl font-light text-slate-600">[ ]</div>
                <h1 className="text-4xl font-bold text-white">Keranjang Belanja Kosong</h1>
                <p className="text-lg text-slate-400">Tidak ada item di keranjang Anda. Mulai belanja sekarang untuk menemukan produk fashion pilihan Anda.</p>
              </div>

              <Link href="/">
                <button className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01]">
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
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-2">Keranjang Belanja</h1>
              <p className="text-slate-400">Anda memiliki {totalItems} item dalam keranjang</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/80 shadow-2xl transition hover:-translate-y-1 hover:border-cyan-500/30"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex gap-6 p-6">
                      {item.image && (
                        <div className="relative h-32 w-32 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full rounded-2xl object-cover shadow-lg transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="text-lg font-bold text-white transition hover:text-cyan-400">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-2xl font-bold text-white">Rp {item.price?.toLocaleString("id-ID")}</p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-10 w-10 rounded-2xl border border-slate-700/80 bg-slate-950/80 font-semibold text-white transition hover:border-cyan-400"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-3 py-2 text-center text-white outline-none transition focus:border-cyan-400"
                            min="1"
                          />
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 rounded-2xl border border-slate-700/80 bg-slate-950/80 font-semibold text-white transition hover:border-cyan-400"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Subtotal</p>
                          <p className="text-2xl font-bold text-white">
                            Rp {(item.price * item.quantity)?.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="rounded-2xl bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={clearCart}
                  className="w-full rounded-3xl border border-rose-500/30 bg-rose-500/10 px-6 py-3 font-semibold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Kosongkan Semua Item
                </button>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                  <h2 className="mb-6 text-2xl font-bold text-white">Ringkasan Pesanan</h2>

                  <div className="space-y-4 mb-8 border-t border-white/10 pt-6">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal ({totalItems} item)</span>
                      <span className="font-semibold text-white">Rp {totalPrice?.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Ongkir</span>
                      <span className="text-sm text-slate-500">Dihitung saat checkout</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-400">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Rp {totalPrice?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-bold text-slate-950 shadow-lg transition hover:scale-[1.01] mb-3"
                  >
                    Lanjut ke Checkout
                  </button>

                  <Link href="/" className="block">
                    <button className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-6 py-3 font-semibold text-slate-100 transition hover:border-cyan-400">
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
