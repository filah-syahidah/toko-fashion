"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    shippingMethod: "standart",
  });

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      router.push("/cart");
      return;
    }
    setCartItems(cart);
    setLoading(false);
  }, [router]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const shippingCost = formData.shippingMethod === "express" ? 50000 : 20000;
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const grandTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
      alert("Lengkapi semua field wajib!");
      return;
    }

    const order = {
      items: cartItems,
      totalPrice,
      shippingCost,
      grandTotal,
      customer: formData,
      status: "pending",
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "orders"), order);
      alert("✅ Pesanan berhasil dibuat!");
      localStorage.setItem("cart", JSON.stringify([]));
      router.push("/");
    } catch (error: any) {
      console.error("ORDER ERROR:", error);
      alert("❌ Gagal membuat pesanan: " + (error.message || "Coba lagi"));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <p className="text-lg text-slate-400">Memproses checkout...</p>
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
            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Checkout</h1>
              <p className="text-slate-400 text-base sm:text-lg">Lengkapi informasi pengiriman dan pesanan Anda</p>
            </div>

            {/* Mobile: Summary First, Then Form | Desktop: Form + Summary */}
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
              
              {/* Summary - Top on Mobile */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <div className="sticky top-6 lg:top-24 rounded-3xl border border-white/10 bg-slate-900/80 p-6 lg:p-8 shadow-2xl backdrop-blur-xl">
                  <h2 className="mb-6 text-xl sm:text-2xl font-bold text-white">Ringkasan Pesanan</h2>

                  <div className="space-y-3 mb-8 max-h-72 sm:max-h-80 overflow-y-auto border-b border-white/10 pb-6 sm:pb-8 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 py-2 text-sm sm:text-base">
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">x{item.quantity}</p>
                        </div>
                        <span className="font-bold text-white whitespace-nowrap">
                          Rp {(item.price * item.quantity)?.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border-b border-white/10 pb-6 sm:pb-8 mb-6 sm:mb-8">
                    <div className="flex justify-between text-sm sm:text-base text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">Rp {totalPrice?.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base text-slate-300">
                      <span>Pengiriman</span>
                      <span className="font-semibold text-cyan-400">Rp {shippingCost?.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-r from-slate-950/90 to-slate-900/90 p-5 sm:p-6 mb-6 border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-slate-300">Total</span>
                      <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                        Rp {grandTotal?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs sm:text-sm text-emerald-200 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 mt-0.5 bg-emerald-500 rounded-full flex-shrink-0"></span>
                      <span>Pembayaran aman & terjamin. Pesanan diproses setelah konfirmasi.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form - Full Width Mobile */}
              <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Shipping Info */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 font-bold text-lg">1</span>
                      Informasi Pengiriman
                    </h2>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-200">Nama Lengkap *</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Masukkan nama lengkap"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 invalid:border-rose-500"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-200">Email *</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="contoh@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-200">Nomor Telepon *</label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="0812 3456 7890"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-200">Alamat Lengkap *</label>
                        <textarea
                          name="address"
                          placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan..."
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full min-h-[100px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 resize-vertical"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-200">Kota *</label>
                          <input
                            type="text"
                            name="city"
                            placeholder="Jakarta Pusat"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-3 block text-sm font-semibold text-slate-200">Kode Pos</label>
                          <input
                            type="text"
                            name="zipCode"
                            placeholder="12120"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="w-full min-h-[52px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 px-5 py-3 text-slate-100 text-base outline-none transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-8 h-8 bg-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 font-bold text-lg">2</span>
                      Metode Pengiriman
                    </h2>

                    <div className="space-y-3">
                      <label className="group flex items-center gap-4 p-5 sm:p-6 rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 cursor-pointer transition-all hover:border-cyan-400 hover:bg-slate-900/50 hover:shadow-lg active:scale-[0.98]">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="standart"
                          checked={formData.shippingMethod === "standart"}
                          onChange={handleChange}
                          className="h-5 w-5 accent-cyan-400 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-base">🚚 Standar (3-5 hari)</p>
                          <p className="text-sm text-slate-400">Pengiriman reguler - Hemat biaya</p>
                        </div>
                        <p className="font-bold text-emerald-400 text-lg whitespace-nowrap">Rp 20.000</p>
                      </label>

                      <label className="group flex items-center gap-4 p-5 sm:p-6 rounded-3xl border-2 border-slate-700/80 bg-slate-950/70 cursor-pointer transition-all hover:border-cyan-400 hover:bg-slate-900/50 hover:shadow-lg active:scale-[0.98]">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="express"
                          checked={formData.shippingMethod === "express"}
                          onChange={handleChange}
                          className="h-5 w-5 accent-cyan-400 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-base">⚡ Express (1-2 hari)</p>
                          <p className="text-sm text-slate-400">Pengiriman kilat - Prioritas</p>
                        </div>
                        <p className="font-bold text-orange-400 text-lg whitespace-nowrap">Rp 50.000</p>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <Link href="/cart" className="flex-1">
                      <button
                        type="button"
                        className="w-full min-h-[56px] rounded-3xl border-2 border-slate-700/80 bg-slate-950/80 px-6 py-4 font-bold text-slate-100 text-base transition-all hover:border-cyan-400 hover:bg-slate-900/50 active:scale-[0.98] shadow-lg"
                      >
                        ← Kembali ke Keranjang
                      </button>
                    </Link>
                    <button
                      type="submit"
                      className="flex-1 min-h-[56px] rounded-3xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 px-6 py-4 font-bold text-slate-950 text-lg shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-cyan-500/25 hover:from-cyan-600 hover:to-purple-700"
                    >
                      💳 Proses Pembayaran
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}