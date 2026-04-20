"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getProducts = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "product"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.2),_transparent_40%)]" />

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="mb-16 space-y-6 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80">Koleksi Eksklusif</p>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                Tren Fashion Terkini
              </h1>
              <p className="text-lg text-slate-300 leading-8">
                Jelajahi koleksi fashion terbaru kami dengan desain modern dan kualitas premium. Temukan gaya yang sempurna untuk Anda.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="text-slate-400">Sedang memuat produk...</div>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700/70 bg-slate-900/70 p-10 text-center text-slate-400">
                Belum ada produk. Tambahkan produk di halaman admin.
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {products.map((item, index) => {
                  const imageSrc = item.ImgUrl || item.imageUrl || "";
                  const bestsellerPercent = typeof item.bestseller === "number"
                    ? item.bestseller
                    : item.bestseller
                      ? 80
                      : 20;

                  return (
                    <Link key={item.id} href={`/products/${item.id}`}>
                      <div className="group h-full overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 transition hover:border-cyan-500/40 hover:shadow-lg cursor-pointer">
                        <div className="relative aspect-square overflow-hidden bg-slate-800">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-500 text-xs">No Image</div>
                          )}
                          {item.bestseller && (
                            <div className="absolute top-2 right-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-1 text-[10px] font-bold text-white">
                              Best Seller
                            </div>
                          )}
                          {item.stock <= 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">Habis</span>
                            </div>
                          )}
                        </div>

                        <div className="p-3">
                          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 h-9">{item.name}</h3>

                          <p className="text-base font-bold text-white mb-2">Rp {item.price?.toLocaleString("id-ID")}</p>

                          {item.category && (
                            <span className="inline-block rounded-lg bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-200 mb-2">
                              {item.category}
                            </span>
                          )}

                          <div className="space-y-1 mb-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>Penjualan</span>
                              <span className="font-semibold text-white">{bestsellerPercent}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                                style={{ width: `${Math.min(100, Math.max(0, bestsellerPercent))}%` }}
                              />
                            </div>
                          </div>

                          <button className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-2 text-xs font-semibold text-slate-950 transition hover:scale-[1.02]">
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
