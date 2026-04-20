"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);

  const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "product"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProducts(data);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Daftar Produk</h1>

      {products.map((item) => {
        const imageSrc = item.ImgUrl || item.imageUrl || "";
        const bestsellerPercent = typeof item.bestseller === "number"
          ? item.bestseller
          : item.bestseller
            ? 80
            : 20;

        return (
          <div key={item.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px", borderRadius: "8px" }}>
            {imageSrc && (
              <img
                src={imageSrc}
                alt={item.name || "Produk"}
                style={{ width: "100%", maxWidth: "300px", objectFit: "cover", borderRadius: "6px", marginBottom: "10px" }}
              />
            )}
            <h2>{item.name}</h2>
            <p>Harga: Rp {item.price}</p>
            <p>Stok: {item.stock}</p>
            {item.category && <p>Kategori: {item.category}</p>}
            <div style={{ marginTop: "12px" }}>
              <p style={{ margin: "0 0 6px 0" }}>Bestseller:</p>
              <div style={{ width: "100%", maxWidth: "300px", height: "14px", borderRadius: "999px", background: "#eee" }}>
                <div style={{ width: `${Math.min(100, Math.max(0, bestsellerPercent))}%`, height: "100%", borderRadius: "999px", background: "#4caf50" }} />
              </div>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.95rem", color: "#333" }}>{Math.min(100, Math.max(0, bestsellerPercent))}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
