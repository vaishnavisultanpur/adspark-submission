import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Your campaigns</h1>
          <p className="text-sm text-slate-400 mt-1">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-2 bg-amber-400 text-slate-900 font-medium text-sm px-4 py-2 rounded-full hover:bg-amber-300 transition"
        >
          <PlusCircle size={16} /> New campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="border border-dashed border-white/15 rounded-2xl py-16 text-center">
          <p className="text-slate-400 mb-4">No campaigns yet. Create your first one.</p>
          <Link href="/dashboard/campaigns/new" className="text-amber-400 hover:underline text-sm">
            Get started →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/campaigns/${c.id}`}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-amber-400/30 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{c.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "generated"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{c.productBrief}</p>
              <p className="text-xs text-slate-500 mt-3">Tone: {c.tone}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
