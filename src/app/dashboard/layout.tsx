import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen md:flex">
      <DashboardNav userName={session.user.name || "there"} />
      <main className="flex-1 px-6 md:px-10 py-8 max-w-5xl">{children}</main>
    </div>
  );
}
