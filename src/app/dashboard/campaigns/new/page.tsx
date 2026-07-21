"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TONES = ["Friendly", "Professional", "Bold", "Playful", "Luxury"];

export default function NewCampaignPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    productBrief: "",
    productLink: "",
    tone: "Friendly",
    audience: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push(`/dashboard/campaigns/${data.id}`);
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-1">New campaign</h1>
      <p className="text-sm text-slate-400 mb-8">
        Give AdSpark a brief and it will generate 3 ad variants for you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Campaign title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
            placeholder="Summer sale — running shoes"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Product / brief</label>
          <textarea
            required
            rows={4}
            value={form.productBrief}
            onChange={(e) => setForm({ ...form, productBrief: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
            placeholder="Lightweight running shoes with breathable mesh, 20% off this week..."
          />
        </div>
        <div>
          <label className="text-sm text-slate-300 mb-1 block">Product link (optional)</label>
          <input
            type="url"
            value={form.productLink}
            onChange={(e) => setForm({ ...form, productLink: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
            placeholder="https://yourstore.com/product"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Brand tone</label>
            <select
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
            >
              {TONES.map((t) => (
                <option key={t} value={t} className="bg-[#0B0E14]">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300 mb-1 block">Audience (optional)</label>
            <input
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50"
              placeholder="Runners, 25-40"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-amber-400 text-slate-900 font-medium px-5 py-2.5 rounded-lg hover:bg-amber-300 transition disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create campaign"}
        </button>
      </form>
    </div>
  );
}
