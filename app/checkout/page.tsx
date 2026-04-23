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
      alert("Lengkapi semua field!");
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

      alert("Pesanan berhasil dibuat!");
      localStorage.setItem("cart", JSON.stringify([]));
      router.push("/");
    } catch (error: any) {
      console.error("ORDER ERROR:", error);
      alert(error.message || "Gagal membuat pesanan!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Memproses checkout...</p>
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
              <h1 className="text-4xl font-bold text-white mb-2">Checkout</h1>
              <p className="text-slate-400">Lengkapi informasi pengiriman dan pilih metode pembayaran</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Informasi Pengiriman</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">Nama Lengkap</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Bambang Susanto"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Nomor Telepon</label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="08123456789"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">Alamat Lengkap</label>
                        <textarea
                          name="address"
                          placeholder="Jl. Contoh No. 123, Kelurahan..."
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400 resize-none"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Kota</label>
                          <input
                            type="text"
                            name="city"
                            placeholder="Jakarta"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Kode Pos</label>
                          <input
                            type="text"
                            name="zipCode"
                            placeholder="12345"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Metode Pengiriman</h2>

                    <div className="space-y-3">
                      <label className="flex items-center gap-4 rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5 cursor-pointer transition hover:border-cyan-400">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="standart"
                          checked={formData.shippingMethod === "standart"}
                          onChange={handleChange}
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">Standar (3-5 hari)</p>
                          <p className="text-sm text-slate-400">Pengiriman reguler</p>
                        </div>
                        <p className="font-semibold text-white">Rp 20.000</p>
                      </label>

                      <label className="flex items-center gap-4 rounded-3xl border border-slate-700/80 bg-slate-950/70 p-5 cursor-pointer transition hover:border-cyan-400">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value="express"
                          checked={formData.shippingMethod === "express"}
                          onChange={handleChange}
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-white">Express (1-2 hari)</p>
                          <p className="text-sm text-slate-400">Pengiriman cepat</p>
                        </div>
                        <p className="font-semibold text-white">Rp 50.000</p>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      className="flex-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 font-bold text-slate-950 shadow-lg transition hover:scale-[1.01]"
                    >
                      Proses Pembayaran
                    </button>
                    <Link href="/cart" className="flex-1">
                      <button
                        type="button"
                        className="w-full rounded-3xl border border-slate-700/80 bg-slate-950/80 px-6 py-4 font-semibold text-slate-100 transition hover:border-cyan-400"
                      >
                        Kembali ke Keranjang
                      </button>
                    </Link>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
                  <h2 className="mb-6 text-2xl font-bold text-white">Ringkasan Pesanan</h2>

                  <div className="space-y-3 mb-8 max-h-80 overflow-y-auto border-b border-white/10 pb-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between gap-3 text-sm">
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">x{item.quantity}</p>
                        </div>
                        <span className="font-semibold text-white">Rp {(item.price * item.quantity)?.toLocaleString("id-ID")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border-b border-white/10 pb-8 mb-8">
                    <div className="flex justify-between text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-semibold text-white">Rp {totalPrice?.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pengiriman</span>
                      <span className="font-semibold text-cyan-400">Rp {shippingCost?.toLocaleString("id-ID")}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-400">Total</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Rp {grandTotal?.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-200">
                    Pembayaran akan diproses setelah Anda klik tombol "Proses Pembayaran"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
