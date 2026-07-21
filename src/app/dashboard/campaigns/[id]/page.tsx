import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import CampaignDetailClient from "./CampaignDetailClient";

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;

  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId },
  });

  if (!campaign) notFound();

  const variants = await prisma.variant.findMany({
    where: { campaignId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return <CampaignDetailClient campaign={campaign} initialVariants={variants} />;
}
