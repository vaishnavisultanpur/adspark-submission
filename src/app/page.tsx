import Link from "next/link";
import { Zap, Image as ImageIcon, Wand2, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Zap className="text-amber-400" size={22} strokeWidth={2.5} />
          AdSpark
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition">
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-amber-400 text-slate-900 font-medium px-4 py-2 rounded-full hover:bg-amber-300 transition"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center px-6 pt-16 pb-20">
        <div className="inline-block text-xs uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-full px-3 py-1 mb-6">
          Built for small marketing teams
        </div>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
          Quick, custom ads
          <br />
          <span className="text-amber-400">in one click.</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Drop in a product brief, answer a quick brand-tone quiz, and get
          ready-to-use headline, body copy, and CTA variants in under a minute.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-amber-400 text-slate-900 font-medium px-6 py-3 rounded-full hover:bg-amber-300 transition"
        >
          Create your first campaign <ArrowRight size={18} />
        </Link>
      </section>

      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5 px-6 pb-24">
        {[
          {
            icon: Wand2,
            title: "AI copy in seconds",
            desc: "Claude-powered generation turns a rough brief into 3 distinct, on-brand ad angles.",
          },
          {
            icon: ImageIcon,
            title: "A/B ready variants",
            desc: "Every campaign ships with benefit-led, urgency-led, and social-proof-led copy to test.",
          },
          {
            icon: Zap,
            title: "No design skills needed",
            desc: "Answer a short brand-tone quiz once — every campaign after that matches your voice.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-amber-400/30 transition"
          >
            <f.icon className="text-amber-400 mb-4" size={24} />
            <h3 className="font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
