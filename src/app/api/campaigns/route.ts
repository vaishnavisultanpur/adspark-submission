import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const campaignSchema = z.object({
  title: z.string().min(2, "Title is required"),
  productBrief: z.string().min(10, "Give a bit more detail about the product (10+ chars)"),
  productLink: z.string().url().optional().or(z.literal("")),
  tone: z.string().min(1, "Pick a brand tone"),
  audience: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const campaigns = await prisma.campaign.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = campaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { title, productBrief, productLink, tone, audience } = parsed.data;
  const userId = (session.user as any).id;

  const campaign = await prisma.campaign.create({
    data: {
      userId,
      title,
      productBrief,
      productLink: productLink || "",
      tone,
      audience: audience || "",
    },
  });

  return NextResponse.json({ id: campaign.id }, { status: 201 });
}
