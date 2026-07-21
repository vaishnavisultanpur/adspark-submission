"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Zap, LayoutGrid, PlusCircle, LogOut } from "lucide-react";

export default function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Campaigns", icon: LayoutGrid },
    { href: "/dashboard/campaigns/new", label: "New campaign", icon: PlusCircle },
  ];

  return (
    <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-white/10 px-6 py-6 flex md:flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 font-semibold mb-8">
          <Zap className="text-amber-400" size={20} strokeWidth={2.5} />
          AdSpark
        </div>
        <nav className="flex md:flex-col gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition ${
                  active ? "bg-amber-400/10 text-amber-400" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="hidden md:block">
        <p className="text-xs text-slate-500 mb-2 truncate">Signed in as {userName}</p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}
