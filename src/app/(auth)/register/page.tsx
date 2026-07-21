"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap } from "lucide-react";

const TONES = ["Friendly", "Professional", "Bold", "Playful", "Luxury"];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", brandTone: "Friendly" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Zap className="text-amber-400" size={22} strokeWidth={2.5} />
          <span className="font-semibold text-lg">AdSpark</span>
        </div>
        <h1 className="text-2xl font-semibold text-center mb-1">Create your account</h1>
        <p className="text-sm text-slate-400 text-center mb-8">Start generating ads in minutes</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Default brand tone</label>
            <select
              value={form.brandTone}
              onChange={(e) => setForm({ ...form, brandTone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="bg-[#0B0E14]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 text-slate-900 font-medium py-2.5 rounded-lg hover:bg-amber-300 transition disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
