"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [useUrl, setUseUrl] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUseUrl, setEditUseUrl] = useState(true);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");

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

    // Jika pilih upload file baru
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

    // Update Firestore
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

    // Jika pilih upload file
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

    // Simpan ke Firestore
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Tambah Produk</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
          <input
            type="text"
            placeholder="Nama Produk"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Harga"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Stok"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="border p-2 rounded"
            required
          />

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="imageType"
                checked={!useUrl}
                onChange={() => setUseUrl(false)}
                className="mr-2"
              />
              Upload File
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="imageType"
                checked={useUrl}
                onChange={() => setUseUrl(true)}
                className="mr-2"
              />
              Paste URL
            </label>
          </div>

          {!useUrl ? (
            <input
              key="file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="border p-2 rounded"
              required
            />
          ) : (
            <input
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="border p-2 rounded"
              required
            />
          )}

          {(imageFile || imageUrl) && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Preview:</p>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}

          <button className="bg-black text-white p-2 rounded">
            Tambah Produk
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Daftar Produk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((item) => {
            const imageSrc = item.ImgUrl || item.imageUrl || "";
            const bestsellerPercent = typeof item.bestseller === "number"
              ? item.bestseller
              : item.bestseller
                ? 80
                : 20;

            return (
              <div key={item.id} className="border p-4 rounded-lg">
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt={item.name || "Produk"}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold">{item.name}</h3>
                <p>Harga: Rp {item.price}</p>
                <p>Stok: {item.stock}</p>
                {item.category && <p>Kategori: {item.category}</p>}
                <div className="mt-2">
                  <p className="text-sm">Bestseller:</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, bestsellerPercent))}%` }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">{Math.min(100, Math.max(0, bestsellerPercent))}%</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEditOpen(item)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Edit Produk</h2>

            <input
              type="text"
              placeholder="Nama Produk"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="number"
              placeholder="Harga"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <input
              type="number"
              placeholder="Stok"
              value={editStock}
              onChange={(e) => setEditStock(e.target.value)}
              className="border p-2 rounded w-full mb-3"
            />

            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="editImageType"
                  checked={editUseUrl}
                  onChange={() => setEditUseUrl(true)}
                  className="mr-2"
                />
                URL
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="editImageType"
                  checked={!editUseUrl}
                  onChange={() => setEditUseUrl(false)}
                  className="mr-2"
                />
                Upload File
              </label>
            </div>

            {editUseUrl ? (
              <input
                type="text"
                placeholder="Image URL"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="border p-2 rounded w-full mb-3"
              />
            ) : (
              <input
                key="edit-file-input"
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full mb-3"
              />
            )}

            {editPreviewUrl && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Preview:</p>
                <img
                  src={editPreviewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="bg-green-500 text-white px-4 py-2 rounded flex-1"
              >
                Simpan
              </button>
              <button
                onClick={handleEditClose}
                className="bg-gray-400 text-white px-4 py-2 rounded flex-1"
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
