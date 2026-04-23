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
  const [orders, setOrders] = useState<any[]>([]);
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

  // 1. Fungsi Ambil Data Produk
  const getProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "product"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // 2. Fungsi Ambil Data Pesanan
  const getOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        if (user.email !== "admin@gmail.com") {
          alert("Akses ditolak! Ini halaman admin.");
          router.push("/");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load Data awal
  useEffect(() => {
    getProducts();
    getOrders();
  }, []);

  // Sync data saat tab berubah
  useEffect(() => {
    if (activeTab === "orders") getOrders();
    if (activeTab === "produk" || activeTab === "dashboard") getProducts();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "product", id));
    getProducts(); // Refresh list
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
        if (data.success) finalImageUrl = data.data.url;
      } catch (error) {
        alert("Gagal upload gambar!");
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
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
        if (data.success) finalImageUrl = data.data.url;
      } catch (error) {
        alert("Gagal upload!");
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
    setName(""); setPrice(""); setStock(""); setImageUrl(""); setImageFile(null);
    setActiveTab("produk"); // Otomatis pindah ke daftar
    getProducts();
  };

  const lowStockCount = products.filter((item) => Number(item.stock) <= 5).length;
  const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/60 p-6 sticky top-0 h-screen">
          <h1 className="text-2xl font-bold text-white mb-8">Admin Panel</h1>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "dashboard" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Dashboard</button>
            <button onClick={() => setActiveTab("tambah")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "tambah" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Tambah Produk</button>
            <button onClick={() => setActiveTab("produk")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "produk" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Daftar Produk</button>
            <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "orders" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Data Pesanan</button>
            <hr className="border-white/10 my-4" />
            <button onClick={() => window.open("/", "_blank")} className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-slate-300 hover:bg-slate-800 transition">Lihat Toko</button>
            <button onClick={async () => { await signOut(auth); router.push("/login"); }} className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-rose-300 hover:bg-rose-500/10 transition">Logout</button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Data Pesanan</h2>
              {orders.length === 0 ? <p className="text-slate-400">Belum ada pesanan</p> : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-slate-900 border border-white/5 p-5 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-lg">{order.customer?.fullName || "No Name"}</p>
                          <p className="text-sm text-slate-400">{order.customer?.phone}</p>
                        </div>
                        <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold uppercase">{order.status}</span>
                      </div>
                      <p className="text-sm mt-3 font-mono text-slate-300">Total Tagihan: <span className="text-white font-bold text-base">Rp {order.grandTotal?.toLocaleString("id-ID")}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Dashboard</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400 font-semibold">Total Produk</p>
                  <p className="text-4xl font-bold text-white mt-3">{products.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400 font-semibold">Total Stok</p>
                  <p className="text-4xl font-bold text-white mt-3">{totalStock}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-rose-400">
                  <p className="text-sm font-semibold">Stok Rendah</p>
                  <p className="text-4xl font-bold mt-3">{lowStockCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TAMBAH */}
          {activeTab === "tambah" && (
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-white mb-6">Tambah Produk</h2>
              <form onSubmit={handleSubmit} className="space-y-5 bg-slate-900/80 p-8 rounded-2xl border border-white/10">
                <input type="text" placeholder="Nama Produk" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-400" required />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Harga" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-400" required />
                  <input type="number" placeholder="Stok" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-400" required />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setUseUrl(false)} className={`flex-1 py-2 rounded-xl border ${!useUrl ? 'border-cyan-400 text-cyan-400' : 'border-slate-700'}`}>Upload File</button>
                  <button type="button" onClick={() => setUseUrl(true)} className={`flex-1 py-2 rounded-xl border ${useUrl ? 'border-cyan-400 text-cyan-400' : 'border-slate-700'}`}>Paste URL</button>
                </div>
                {useUrl ? (
                  <input type="url" placeholder="URL Gambar" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3" />
                ) : (
                  <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-500/10 file:text-cyan-400" />
                )}
                <button type="submit" className="w-full py-4 bg-cyan-500 rounded-xl text-black font-black uppercase tracking-widest hover:bg-cyan-400 transition-all">Simpan Produk</button>
              </form>
            </div>
          )}

          {/* TAB: PRODUK */}
          {activeTab === "produk" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((item) => (
                <div key={item.id} className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
                  <img src={item.ImgUrl || item.imageUrl} className="h-48 w-full object-cover" alt="" />
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-cyan-400 font-bold mb-4">Rp {item.price?.toLocaleString("id-ID")}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditOpen(item)} className="flex-1 bg-blue-500/20 text-blue-300 py-2 rounded-lg text-sm font-bold">Edit</button>
                      <button onClick={() => confirm("Hapus?") && handleDelete(item.id)} className="flex-1 bg-rose-500/20 text-rose-300 py-2 rounded-lg text-sm font-bold">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL EDIT (Tetap ada namun ringkas) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-950 border border-white/10 p-8 rounded-3xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Edit Produk</h2>
            <div className="space-y-4">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Nama" />
              <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Harga" />
              <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl" placeholder="Stok" />
              <div className="flex gap-2 mt-6">
                <button onClick={handleEditSave} className="flex-1 bg-cyan-500 text-black font-bold py-3 rounded-xl">Simpan</button>
                <button onClick={handleEditClose} className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl">Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}