"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [useUrl, setUseUrl] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUseUrl, setEditUseUrl] = useState(true);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      router.push("/login");
    } else {
      // 🔒 GANTI EMAIL INI DENGAN EMAIL ADMIN KAMU
      if (user.email !== "admin@gmail.com") {
        alert("Akses ditolak! Ini halaman admin.");
        router.push("/");
      }
    }
  });

  return () => unsubscribe();
}, [router]);
  const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "product"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "product", id));
    getProducts();
  };

  const handleEditOpen = (product: any) => {
    const currentImage = product.ImgUrl || product.imageUrl || "";
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditImageUrl(currentImage);
    setEditUseUrl(true);
    setEditImageFile(null);
    setEditPreviewUrl(currentImage);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editName || !editPrice || !editStock) {
      alert("Semua field harus diisi!");
      return;
    }

    let finalImageUrl = editImageUrl;

    if (!editUseUrl && editImageFile) {
      const formData = new FormData();
      formData.append("image", editImageFile);
      formData.append("key", "8370da46d3b0a0495bf7fe5e0544b06d");

      try {
        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!data.success) {
          alert("Upload gambar gagal!");
          return;
        }

        finalImageUrl = data.data.url;
      } catch (error) {
        alert("Terjadi kesalahan saat upload!");
        console.error(error);
        return;
      }
    }

    await updateDoc(doc(db, "product", editingId), {
      name: editName,
      price: Number(editPrice),
      stock: Number(editStock),
      ImgUrl: finalImageUrl,
      imageUrl: finalImageUrl,
    });

    alert("Produk berhasil diupdate!");
    setShowEditModal(false);
    getProducts();
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditImageFile(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    getProducts();
  }, []);

  useEffect(() => {
    if (useUrl) {
      setImageFile(null);
    } else {
      setImageUrl("");
    }
  }, [useUrl]);

  useEffect(() => {
    if (editUseUrl) {
      setEditImageFile(null);
      setEditPreviewUrl(editImageUrl);
      return;
    }

    setEditImageUrl("");
    if (!editImageFile) {
      setEditPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(editImageFile);
    setEditPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [editUseUrl, editImageUrl, editImageFile]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      alert("Nama, harga, dan stok harus diisi!");
      return;
    }

    if (useUrl && !imageUrl) {
      alert("URL gambar harus diisi!");
      return;
    }

    if (!useUrl && !imageFile) {
      alert("File gambar harus dipilih!");
      return;
    }

    let finalImageUrl = imageUrl;

    if (!useUrl && imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("key", "8370da46d3b0a0495bf7fe5e0544b06d");

      try {
        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!data.success) {
          alert("Upload gambar gagal!");
          return;
        }

        finalImageUrl = data.data.url;
      } catch (error) {
        alert("Terjadi kesalahan saat upload!");
        console.error(error);
        return;
      }
    }

    await addDoc(collection(db, "product"), {
      name,
      price: Number(price),
      stock: Number(stock),
      ImgUrl: finalImageUrl,
      imageUrl: finalImageUrl,
      category: "Clothing",
      bestseller: false,
    });

    alert("Produk berhasil ditambahkan!");
    setName("");
    setPrice("");
    setStock("");
    setImageUrl("");
    setImageFile(null);
    getProducts();
  };

  const lowStockCount = products.filter((item) => Number(item.stock) <= 5).length;
  const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/60 p-6 sticky top-0 h-screen overflow-y-auto">
          <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>
          <nav className="space-y-3">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "dashboard"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-800"
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("tambah")}
              className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "tambah"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-800"
                }`}
            >
              Tambah Produk
            </button>
            <button
              onClick={() => setActiveTab("produk")}
              className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "produk"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-slate-800"
                }`}
            >
              Daftar Produk
            </button>
            <hr className="border-white/10 my-4" />
            <button
              onClick={() => window.open("/", "_blank")}
              className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Lihat Toko
            </button>

            <button
              onClick={async () => {
                await signOut(auth);
                router.push("/login");
              }}
              className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-rose-300 hover:bg-rose-500/10 transition"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Dashboard</h2>
                <p className="text-slate-400">Overview toko Anda</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400 font-semibold">Total Produk</p>
                  <p className="text-4xl font-bold text-white mt-3">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400 font-semibold">Total Stok</p>
                  <p className="text-4xl font-bold text-white mt-3">{totalStock}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400 font-semibold">Stok Rendah</p>
                  <p className="text-4xl font-bold text-rose-400 mt-3">{lowStockCount}</p>
                  <p className="text-xs text-slate-500 mt-1">(≤ 5 item)</p>
                </div>
              </div>

              <button
                onClick={() => getProducts()}
                className="px-4 py-2 rounded-2xl bg-cyan-500/20 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition"
              >
                Segarkan Data
              </button>
            </div>
          )}

          {activeTab === "tambah" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white">Tambah Produk Baru</h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">Nama Produk</label>
                    <input
                      type="text"
                      placeholder="Misal: Kaos Premium Katun"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">Harga (Rp)</label>
                      <input
                        type="number"
                        placeholder="100000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">Stok</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-slate-700/80 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-slate-200">Sumber Gambar</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 cursor-pointer transition hover:border-cyan-400">
                        <input
                          type="radio"
                          name="imageType"
                          checked={!useUrl}
                          onChange={() => setUseUrl(false)}
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <span className="font-medium text-slate-100">Upload File</span>
                      </label>
                      <label className="flex items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 cursor-pointer transition hover:border-cyan-400">
                        <input
                          type="radio"
                          name="imageType"
                          checked={useUrl}
                          onChange={() => setUseUrl(true)}
                          className="h-4 w-4 accent-cyan-400"
                        />
                        <span className="font-medium text-slate-100">Paste URL</span>
                      </label>
                    </div>
                  </div>

                  {!useUrl ? (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">Pilih File Gambar</label>
                      <input
                        key="file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">URL Gambar</label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                        required
                      />
                    </div>
                  )}

                  {(imageFile || imageUrl) && (
                    <div className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4">
                      <p className="text-sm font-semibold text-slate-200 mb-3">Preview Gambar</p>
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                        alt="Preview"
                        className="w-full rounded-2xl object-cover border border-slate-700/80"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01]"
                  >
                    Tambah Produk
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "produk" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white">Daftar Produk</h2>
                <p className="text-slate-400 mt-2">Total: {products.length} produk</p>
              </div>

              {products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/50 p-8 text-center text-slate-400">
                  Belum ada produk
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {products.map((item) => {
                    const imageSrc = item.ImgUrl || item.imageUrl || "";

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-800/60 bg-slate-900/60 overflow-hidden transition hover:border-cyan-500/40"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-800">
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-500 text-sm">No Image</div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white line-clamp-2 mb-2">{item.name}</h3>
                          <p className="text-lg font-bold text-cyan-400 mb-3">Rp {item.price?.toLocaleString("id-ID")}</p>
                          <div className="flex gap-2 text-xs mb-3">
                            <span className={`rounded-lg px-2 py-1 $  {item.stock > 0 ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"}`}>
                              {item.stock} stok
                            </span>
                            <span className="bg-slate-800 text-slate-300 rounded-lg px-2 py-1">
                              {item.category || "Fashion"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditOpen(item)}
                              className="flex-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-semibold py-2 hover:bg-blue-500/30 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Hapus produk ini?")) {
                                  handleDelete(item.id);
                                }
                              }}
                              className="flex-1 rounded-lg bg-rose-500/20 text-rose-300 text-sm font-semibold py-2 hover:bg-rose-500/30 transition"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-950 p-5 sm:p-6 shadow-2xl">

            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Edit Produk
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Harga
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Stok
                  </label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
                <p className="text-sm font-semibold text-slate-200">
                  Sumber Gambar
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 cursor-pointer transition hover:border-cyan-400">
                    <input
                      type="radio"
                      name="editImageType"
                      checked={editUseUrl}
                      onChange={() => setEditUseUrl(true)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span className="text-sm text-slate-100">URL</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2 cursor-pointer transition hover:border-cyan-400">
                    <input
                      type="radio"
                      name="editImageType"
                      checked={!editUseUrl}
                      onChange={() => setEditUseUrl(false)}
                      className="h-4 w-4 accent-cyan-400"
                    />
                    <span className="text-sm text-slate-100">Upload</span>
                  </label>
                </div>
              </div>

              {editUseUrl ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    File Gambar
                  </label>
                  <input
                    key="edit-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditImageFile(e.target.files?.[0] || null)
                    }
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400"
                  />
                </div>
              )}

              {editPreviewUrl && (
                <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 p-3">
                  <p className="text-sm font-semibold text-slate-200 mb-2">
                    Preview
                  </p>
                  <img
                    src={editPreviewUrl}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-xl border border-slate-700/80"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleEditSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm sm:text-base font-semibold text-slate-950 transition hover:scale-[1.01]"
              >
                Simpan
              </button>
              <button
                onClick={handleEditClose}
                className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 text-sm sm:text-base font-semibold text-slate-100 transition hover:border-rose-400"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
