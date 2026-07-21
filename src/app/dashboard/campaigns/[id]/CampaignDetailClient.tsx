"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

type Variant = {
  id: string;
  variantLabel?: string;
  label?: string;
  headline: string;
  body: string;
  cta: string;
};

export default function CampaignDetailClient({
  campaign,
  initialVariants,
}: {
  campaign: any;
  initialVariants: Variant[];
}) {
  const [variants, setVariants] = useState<Variant[]>(initialVariants);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/generate`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }
      setVariants(data.variants);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(v: Variant) {
    const text = `${v.headline}\n${v.body}\n${v.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(v.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-semibold">{campaign.title}</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-lg">{campaign.productBrief}</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 bg-amber-400 text-slate-900 font-medium text-sm px-4 py-2 rounded-full hover:bg-amber-300 transition disabled:opacity-60 shrink-0"
        >
          <Sparkles size={16} />
          {loading ? "Generating…" : variants.length ? "Regenerate" : "Generate ad copy"}
        </button>
      </div>
      <div className="flex gap-3 text-xs text-slate-500 mb-8">
        <span>Tone: {campaign.tone}</span>
        {campaign.audience && <span>· Audience: {campaign.audience}</span>}
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {variants.length === 0 && !loading && (
        <div className="border border-dashed border-white/15 rounded-2xl py-16 text-center">
          <p className="text-slate-400">No ad copy generated yet.</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {variants.map((v) => (
          <div
            key={v.id}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
                Variant {v.variantLabel || v.label}
              </span>
              <button
                onClick={() => handleCopy(v)}
                className="text-slate-400 hover:text-white transition"
                aria-label="Copy variant"
              >
                {copiedId === v.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <h3 className="font-medium leading-snug mb-2">{v.headline}</h3>
            <p className="text-sm text-slate-400 leading-relaxed flex-1">{v.body}</p>
            <p className="text-xs font-medium text-amber-400 mt-4">{v.cta} →</p>
          </div>
        ))}
      </div>
    </div>
  );
}
