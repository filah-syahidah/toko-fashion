"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function AdminPage() {
  const router = useRouter();

  // ==========================================
  // STATE UNTUK TAMBAH PRODUK (LENGKAP & KONSISTEN)
  // ==========================================
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("clothing");
  const [bestseller, setBestseller] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [useUrl, setUseUrl] = useState(false); // Toggle Upload/URL
  const [isUploading, setIsUploading] = useState(false);

  // ==========================================
  // STATE UNTUK EDIT PRODUK
  // ==========================================
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBestseller, setEditBestseller] = useState(false);

  // STATE UMUM
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orderFilter, setOrderFilter] = useState("semua");

  // FETCH DATA
  const getProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "product"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (error) { console.error("Error products:", error); }
  };

  const getOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
    } catch (error) { console.error("Error orders:", error); }
  };

  // AUTH CHECK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else if (user.email !== "admin@gmail.com") {
        alert("Akses ditolak!");
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    getProducts();
    getOrders();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") getOrders();
    if (activeTab === "produk" || activeTab === "dashboard") getProducts();
  }, [activeTab]);

  // ACTIONS: DELETE
  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini?")) {
      await deleteDoc(doc(db, "product", id));
      getProducts();
    }
  };

  // ACTIONS: EDIT
  const handleEditOpen = (product: any) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditImageUrl(product.ImgUrl || product.imageUrl || "");
    setEditCategory(product.category || "");
    setEditBestseller(product.bestseller || false);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    await updateDoc(doc(db, "product", editingId), {
      name: editName,
      price: Number(editPrice),
      stock: Number(editStock),
      ImgUrl: editImageUrl,
      imageUrl: editImageUrl,
      category: editCategory,
      bestseller: editBestseller,
    });
    setShowEditModal(false);
    getProducts();
  };

  // ACTIONS: SUBMIT TAMBAH (FUNGSI UTAMA KAMU)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsUploading(true);
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
        setIsUploading(false);
        return;
      }
    }

    if (!finalImageUrl) {
      alert("Gambar produk wajib diisi!");
      setIsUploading(false);
      return;
    }

    await addDoc(collection(db, "product"), {
      name,
      price: Number(price),
      stock: Number(stock),
      ImgUrl: finalImageUrl,
      imageUrl: finalImageUrl,
      category,
      bestseller,
      createdAt: new Date().toISOString(),
    });

    alert("Produk berhasil ditambahkan!");
    // Reset States
    setName(""); setPrice(""); setStock(""); setImageUrl("");
    setImageFile(null); setBestseller(false); setIsUploading(false);
    setActiveTab("produk");
    getProducts();
  };

  // LOGIC DASHBOARD
  const pendingOrdersCount = orders.filter(o => (o.status || "pending") === "pending").length;
  const filteredOrders = orders.filter(o => orderFilter === "semua" ? true : (o.status || "pending") === orderFilter);
  const totalStock = products.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const lowStockCount = products.filter((item) => Number(item.stock) <= 5).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/60 p-6 sticky top-0 h-screen">
          <h1 className="text-2xl font-black text-white mb-8 italic uppercase tracking-tighter">Admin Panel</h1>
          <nav className="space-y-3">
            <button onClick={() => setActiveTab("dashboard")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "dashboard" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]" : "text-slate-300 hover:bg-slate-800"}`}>Dashboard</button>
            <button onClick={() => setActiveTab("tambah")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "tambah" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Tambah Produk</button>
            <button onClick={() => setActiveTab("produk")} className={`w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "produk" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>Daftar Produk</button>
            <button onClick={() => setActiveTab("orders")} className={`relative w-full text-left px-4 py-3 rounded-2xl font-semibold transition ${activeTab === "orders" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800"}`}>
              Data Pesanan {pendingOrdersCount > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>}
            </button>
            <hr className="border-white/10 my-4" />
            <button onClick={() => window.open("/", "_blank")} className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-slate-400 hover:bg-slate-800 transition">Lihat Toko</button>
            <button onClick={async () => { await signOut(auth); router.push("/login"); }} className="w-full text-left px-4 py-3 rounded-2xl font-semibold text-rose-300 hover:bg-rose-500/10 transition">Logout</button>
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-8">
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Dashboard Overview</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Produk</p>
                  <p className="text-5xl font-black text-white mt-2">{products.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Stok Inventory</p>
                  <p className="text-5xl font-black text-white mt-2">{totalStock}</p>
                </div>
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] p-8 shadow-2xl">
                  <p className="text-[10px] text-rose-500/60 font-black uppercase tracking-widest">Stok Menipis</p>
                  <p className="text-5xl font-black text-rose-500 mt-2">{lowStockCount}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAMBAH PRODUK TAB (THE COMPLETE FORM) */}
          {activeTab === "tambah" && (
            <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-black text-white mb-8 uppercase italic tracking-tighter text-center">Input Data Produk</h2>
              <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900/80 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Informasi Dasar</label>
                  <input type="text" placeholder="Nama Produk (Contoh: ONIC Jersey 2024)" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-5 py-4 outline-none focus:border-cyan-500 transition-all font-semibold" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Harga (Rp)" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-5 py-4 outline-none focus:border-cyan-500 transition-all font-semibold" required />
                  <input type="number" placeholder="Stok Unit" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-5 py-4 outline-none focus:border-cyan-500 transition-all font-semibold" required />
                </div>

                <input type="text" placeholder="Kategori (clothing/accessories)" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-5 py-4 outline-none focus:border-cyan-500 transition-all font-semibold" />

                {/* MEDIA INPUT TOGGLE (FIXED & CONSISTENT) */}
                <div className="space-y-3 p-2 bg-slate-950 rounded-[1.5rem] border border-slate-800">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setUseUrl(false)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!useUrl ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-500'}`}>Upload File</button>
                    <button type="button" onClick={() => setUseUrl(true)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${useUrl ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-500'}`}>Paste URL</button>
                  </div>
                  <div className="px-2 pb-2">
                    {useUrl ? (
                      <input
                        key="url-input"
                        type="text"
                        placeholder="https://i.ibb.co/..."
                        value={imageUrl || ""}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-500"
                      />
                    ) : (
                      <input
                        key="file-input"
                        type="file"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        className="w-full text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/5 file:text-white file:font-black cursor-pointer"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                  <input type="checkbox" checked={bestseller} onChange={(e) => setBestseller(e.target.checked)} className="w-5 h-5 accent-cyan-500 rounded-lg cursor-pointer" id="bs_check" />
                  <label htmlFor="bs_check" className="text-xs text-slate-300 font-black uppercase tracking-tighter cursor-pointer">Tampilkan di Koleksi Bestseller</label>
                </div>

                <button disabled={isUploading} type="submit" className="w-full py-5 bg-cyan-500 text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_20px_40px_rgba(6,182,212,0.2)] disabled:opacity-50">
                  {isUploading ? "PROCESS UPLOADING..." : "PUBLISH TO STORE"}
                </button>
              </form>
            </div>
          )}

          {/* DAFTAR PRODUK TAB */}
          {activeTab === "produk" && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in duration-700">
              {products.map((item) => (
                <div key={item.id} className="bg-slate-900/60 rounded-[2.5rem] border border-slate-800 overflow-hidden group hover:border-cyan-500/50 transition-all shadow-xl">
                  <div className="relative h-60 overflow-hidden">
                    <img src={item.ImgUrl || item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                    {item.bestseller && <span className="absolute top-4 left-4 bg-cyan-500 text-black text-[8px] font-black px-3 py-1 rounded-full uppercase italic">Top Pick</span>}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                  </div>
                  <div className="p-6 relative">
                    <h3 className="font-black text-white text-xl uppercase italic leading-tight mb-1">{item.name}</h3>
                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-4">{item.category || "General"}</p>
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-cyan-400 font-black text-2xl">Rp {item.price?.toLocaleString("id-ID")}</p>
                      <div className="text-right">
                        <p className="text-slate-500 text-[8px] font-bold uppercase">Stock Available</p>
                        <p className="text-white font-black">{item.stock}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditOpen(item)} className="flex-1 bg-white/5 text-white py-3 rounded-xl text-[10px] font-black uppercase border border-white/5 hover:bg-white/10 transition">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="flex-1 bg-rose-500/10 text-rose-500 py-3 rounded-xl text-[10px] font-black uppercase border border-rose-500/10 hover:bg-rose-500 hover:text-white transition">Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ORDERS TAB (STYLE KARTU KAMU) */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Order Management</h2>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 shadow-inner">
                  {["semua", "pending", "diproses", "selesai"].map((status) => (
                    <button key={status} onClick={() => setOrderFilter(status)} className={`relative px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${orderFilter === status ? "bg-cyan-500 text-black shadow-lg" : "text-slate-500 hover:text-white"}`}>
                      {status} {status === "pending" && pendingOrdersCount > 0 && <span className="ml-1 bg-rose-600 text-white px-1.5 rounded-full text-[8px] animate-pulse">{pendingOrdersCount}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 bg-slate-900/40 rounded-[3rem] border border-dashed border-white/10">
                    <p className="text-slate-500 font-bold uppercase tracking-widest">No matching orders found</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.id} className={`bg-slate-900 border p-8 rounded-[3rem] shadow-2xl transition-all ${(order.status || "pending") === "pending" ? "border-rose-500/30 bg-rose-500/[0.01]" : "border-white/10"}`}>
                      <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/5 pb-6 mb-6">
                        <div>
                          <p className="text-[9px] font-mono text-slate-600 mb-1">TX_ID: {order.id.toUpperCase()}</p>
                          <h3 className="text-white font-black text-2xl uppercase italic tracking-tighter">{order.customer?.fullName || "Guest Customer"}</h3>
                          {(order.status || "pending") === "pending" && <span className="text-[9px] text-rose-500 font-black uppercase animate-pulse">● Awaiting Processing</span>}
                        </div>
                        <div className="text-right">
                          <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'selesai' ? 'bg-green-500/10 text-green-400 border-green-500/20' : order.status === 'diproses' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{order.status || "pending"}</span>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-cyan-500 rounded-full"></div>
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Customer Logistics</h4>
                          </div>
                          <div className="text-sm space-y-2 text-slate-400 font-medium">
                            <p><span className="text-slate-600 font-bold uppercase text-[9px] mr-2">Email</span> {order.customer?.email || "-"}</p>
                            <p><span className="text-slate-600 font-bold uppercase text-[9px] mr-2">WhatsApp</span> {order.customer?.phone || "-"}</p>
                            <div className="bg-slate-950/50 p-5 rounded-[1.5rem] border border-white/5 mt-4">
                              <p className="text-[9px] text-slate-700 font-black uppercase mb-2">Shipping Destination</p>
                              <p className="text-slate-200 leading-relaxed italic">{order.customer?.address || "-"}</p>
                              <p className="text-cyan-400 font-black mt-2 uppercase text-xs tracking-tighter">{order.customer?.city || "-"} • {order.customer?.zipCode || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-6">
                          <div className="bg-slate-950/80 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">Total Transaction</p>
                            <p className="text-4xl font-black text-white">Rp {order.grandTotal?.toLocaleString("id-ID")}</p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={async () => { await updateDoc(doc(db, "orders", order.id), { status: "diproses" }); getOrders(); }} className="flex-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-yellow-500 hover:text-black transition-all">Mark Processed</button>
                            <button onClick={async () => { await updateDoc(doc(db, "orders", order.id), { status: "selesai" }); getOrders(); }} className="flex-1 bg-green-500/10 text-green-500 border border-green-500/20 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-green-500 hover:text-black transition-all">Mark Completed</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL EDIT (GLOBAL) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-950 border border-white/10 p-10 rounded-[3.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <h2 className="text-2xl font-black mb-8 text-white uppercase italic tracking-tight text-center">Modify Product Data</h2>
            <div className="space-y-4">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" placeholder="Product Name" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" placeholder="Price" />
                <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" placeholder="Stock" />
              </div>
              <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500 font-bold" placeholder="Category" />
              <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-700">
                <input type="checkbox" checked={editBestseller} onChange={(e) => setEditBestseller(e.target.checked)} className="w-5 h-5 accent-cyan-500 rounded-md" />
                <label className="text-[10px] text-slate-400 font-black uppercase">Active Bestseller Tag</label>
              </div>
              <input type="text" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500 font-medium text-xs" placeholder="Direct Image URL" />
              <div className="flex gap-3 mt-10">
                <button onClick={handleEditSave} className="flex-1 bg-cyan-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] hover:bg-cyan-400 shadow-lg transition-all">Update</button>
                <button onClick={() => setShowEditModal(false)} className="flex-1 bg-slate-800 text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-700 transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}