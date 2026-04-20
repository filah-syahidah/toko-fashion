"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "product", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          alert("Produk tidak ditemukan!");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        alert("Terjadi kesalahan!");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      alert("Stok tidak cukup!");
      return;
    }

    // Simpan ke localStorage (nanti akan pakai Context API)
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.ImgUrl || product.imageUrl,
        quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Memuat produk...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Produk tidak ditemukan</p>
      </div>
    );
  }

  const imageSrc = product.ImgUrl || product.imageUrl || "";
  const ratingPercent = Math.min(100, Math.max(0, product.bestseller || 20));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.22),_transparent_35%)]" />

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <button
              onClick={() => router.push("/")}
              className="mb-10 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              ← Kembali ke Beranda
            </button>

            <div className="grid gap-12 lg:grid-cols-2">
              <div className="flex items-center justify-center">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={product.name}
                    className="h-full w-full rounded-3xl border border-white/10 object-cover shadow-2xl"
                  />
                ) : (
                  <div className="flex h-96 w-full items-center justify-center rounded-3xl border border-slate-700/80 bg-slate-900/80 text-slate-400">
                    Gambar tidak tersedia
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-white">{product.name}</h1>
                  {product.category && (
                    <span className="inline-block rounded-2xl bg-cyan-500/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
                      {product.category}
                    </span>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4 backdrop-blur-xl">
                  <div className="flex items-end gap-4">
                    <p className="text-4xl font-bold text-white">Rp {product.price?.toLocaleString("id-ID")}</p>
                    <span className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                      product.stock > 0
                        ? "bg-emerald-500/15 text-emerald-200"
                        : "bg-rose-500/15 text-rose-200"
                    }`}>
                      {product.stock > 0 ? `${product.stock} Tersedia` : "Habis"}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
                      <span>Rating Penjualan</span>
                      <span className="font-semibold text-white">{ratingPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${ratingPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-slate-200">Jumlah Pembelian</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-12 w-12 rounded-2xl border border-slate-700/80 bg-slate-900/80 font-semibold text-white transition hover:border-cyan-400"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-center text-white outline-none transition focus:border-cyan-400"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="h-12 w-12 rounded-2xl border border-slate-700/80 bg-slate-900/80 font-semibold text-white transition hover:border-cyan-400"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`w-full rounded-3xl px-6 py-4 text-base font-bold transition ${
                    product.stock === 0
                      ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                      : addedToCart
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg hover:scale-[1.01]"
                  }`}
                >
                  {addedToCart ? "Ditambahkan ke Keranjang" : "Tambahkan ke Keranjang"}
                </button>

                {addedToCart && (
                  <button
                    onClick={() => router.push("/cart")}
                    className="w-full rounded-3xl border border-cyan-400/30 bg-slate-950/80 px-6 py-4 text-base font-semibold text-cyan-200 transition hover:bg-slate-900"
                  >
                    Lihat Keranjang
                  </button>
                )}

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
                  <h3 className="mb-4 text-lg font-bold text-white">Deskripsi Produk</h3>
                  <p className="leading-relaxed text-slate-300">
                    {product.description || "Deskripsi produk tidak tersedia. Hubungi customer support untuk informasi lebih lanjut."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
