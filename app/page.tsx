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
    try {
      const querySnapshot = await getDocs(collection(db, "product"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* 🔥 HEADER FIX FINAL */}
        <div className="mb-12 text-center space-y-6">
          {/* LOGO BESAR DI ATAS */}
          <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
            <img
              src="/banner.png"
              alt="banner"
              className="w-full h-[220px] sm:h-[280px] md:h-[380px] object-cover"
            />
          </div>

          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-cyan-300/80">
            Koleksi Eksklusif
          </p>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Pilih style favoritmu dan beli langsung via WhatsApp atau keranjang.
          </p>
        </div>

        {/* 🔥 CONTENT */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-pulse text-slate-400 font-medium">
              Loading produk...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            Belum ada produk tersedia.
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {products.map((item) => {
              const imageSrc = item.ImgUrl || item.imageUrl || "";
              const isBestseller = item.bestseller === true;

              return (
                <Link key={item.id} href={`/products/${item.id}`}>
                  <div className="group bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 cursor-pointer relative flex flex-col h-full hover:-translate-y-1">

                    {/* BADGE */}
                    {isBestseller && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[9px] font-black px-2 py-1 rounded-md uppercase shadow">
                          Bestseller
                        </span>
                      </div>
                    )}

                    {/* IMAGE */}
                    <div className="aspect-square bg-slate-800 overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-xs italic">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-3 sm:p-4 flex flex-col flex-grow space-y-2">

                      <div className="space-y-1">
                        {item.category && (
                          <p className="text-[9px] sm:text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                            {item.category}
                          </p>
                        )}

                        <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center mt-auto">
                        <p className="font-bold text-sm sm:text-base text-white">
                          <span className="text-[10px] text-slate-400 mr-1">Rp</span>
                          {item.price?.toLocaleString("id-ID")}
                        </p>

                        {item.stock !== undefined && (
                          <p className="text-[9px] text-slate-500">
                            {item.stock}
                          </p>
                        )}
                      </div>

                      {/* BUTTON */}
                      <div className="flex gap-2 pt-2">
                        <button className="flex-1 text-[10px] sm:text-[11px] font-bold bg-slate-800 text-white hover:bg-cyan-500 hover:text-black py-2 rounded-lg transition">
                          Detail
                        </button>

                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const phone = "6289670482450";
                            const message = `Halo, saya tertarik dengan produk ini:\n\n*${item.name}*\nHarga: Rp ${item.price?.toLocaleString("id-ID")}`;
                            window.open(
                              `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
                              "_blank"
                            );
                          }}
                          className="flex-1 text-[10px] sm:text-[11px] font-bold bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg transition"
                        >
                          WA
                        </button>
                      </div>

                    </div>
                  </div>
                </Link>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
}