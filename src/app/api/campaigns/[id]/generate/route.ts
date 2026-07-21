import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// System prompt drives the AI feature: turns a brief + tone into 3 distinct,
// ready-to-use ad variants (A/B/C) with headline, body, and CTA.
const SYSTEM_PROMPT = `You are AdSpark's ad copywriter. Given a product brief, brand tone,
and target audience, generate exactly 3 distinct ad variants (A, B, C) that differ in angle
(e.g. benefit-led, urgency-led, social-proof-led). Each variant must have a headline
(max 8 words), a body (max 30 words), and a CTA (max 5 words). Respond ONLY with valid JSON,
no markdown fences, no preamble, in this exact shape:
{"variants":[{"label":"A","headline":"...","body":"...","cta":"..."}, ...]}`;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const campaign = await prisma.campaign.findFirst({
    where: { id: params.id, userId },
  });

  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  try {
    const userPrompt = `Product / brief: ${campaign.productBrief}
Product link: ${campaign.productLink || "N/A"}
Brand tone: ${campaign.tone}
Target audience: ${campaign.audience || "General audience"}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(userPrompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const saved = await prisma.$transaction(
      parsed.variants.map((v: any) =>
        prisma.variant.create({
          data: {
            campaignId: campaign.id,
            headline: v.headline,
            body: v.body,
            cta: v.cta,
            variantLabel: v.label,
          },
        })
      )
    );

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "generated" },
    });

    return NextResponse.json({ variants: saved });
  } catch (err) {
    console.error("AI generation failed:", err);
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 502 });
  }
}
