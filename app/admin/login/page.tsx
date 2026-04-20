"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login admin berhasil!");
      router.push("/admin");
    } catch (error) {
      alert("Login gagal! Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.28),_transparent_30%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.22),_transparent_35%)]" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-3">
              <Link href="/">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/80 hover:text-cyan-300 transition">
                  Toko Fashion
                </p>
              </Link>
              <h1 className="text-3xl font-extrabold text-white">Admin Login</h1>
              <p className="text-slate-400">Masuk ke dashboard admin untuk mengelola toko Anda</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Email</label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-base font-bold text-slate-950 shadow-lg transition hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading ? "Mengecek..." : "Masuk ke Admin"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Tidak punya akses? Hubungi administrator
              </p>
            </div>

            <p className="text-center text-xs text-slate-500">
              Kembali ke <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">Beranda</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
