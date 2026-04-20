"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<string>("name");

  const getProducts = async () => {
    setIsLoading(true);
    const querySnapshot = await getDocs(collection(db, "product"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
    setFilteredProducts(data);

    // Extract unique categories
    const uniqueCategories = [...new Set(data.map((item: any) => item.category).filter(Boolean))];
    setCategories(uniqueCategories);

    setIsLoading(false);
  };

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((item: any) => item.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter((item: any) => item.price >= priceRange[0] && item.price <= priceRange[1]);

    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(236,72,153,0.2),_transparent_40%)]" />

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-white mb-2">Semua Produk</h1>
              <p className="text-slate-400">Temukan fashion yang Anda cari</p>
            </div>

            {/* Filters */}
            <div className="mb-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl">
              <div className="grid gap-6 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Harga Min</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Harga Max</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    placeholder="10000000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Urutkan</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                  >
                    <option value="name">Nama A-Z</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center min-h-96">
                <div className="text-slate-400">Sedang memuat produk...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700/70 bg-slate-900/70 p-10 text-center text-slate-400">
                Tidak ada produk yang sesuai dengan filter.
              </div>
            ) : (
              <>
                <p className="mb-6 text-slate-400">Menampilkan {filteredProducts.length} produk</p>
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {filteredProducts.map((item: any) => {
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

                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Rating</span>
                                <span className="font-semibold text-white">{bestsellerPercent}%</span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                  style={{ width: `${bestsellerPercent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
