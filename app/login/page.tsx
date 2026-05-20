"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "שגיאה");
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}
      dir="rtl"
    >
      <div className="w-full max-w-sm">
        {/* לוגו */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="NSC"
            width={100}
            height={100}
            className="rounded-full shadow-xl mb-4"
          />
          <h1 className="text-white text-xl font-black">נריה כהן | יועץ משכנתאות</h1>
          <p className="text-blue-100 text-sm mt-1">מערכת ניהול לקוחות</p>
        </div>

        {/* טופס */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="הכנס שם משתמש"
              autoComplete="username"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">סיסמא</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="הכנס סיסמא"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-opacity disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" }}
          >
            {loading ? "מתחבר..." : "כניסה"}
          </button>
        </form>
      </div>
    </main>
  );
}
