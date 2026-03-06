import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const plan = url.searchParams.get("plan");

  if (!userId || !plan) {
    return NextResponse.redirect(new URL("/subscribe?error=missing_params", req.url));
  }

  try {
    // Activate subscription
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        status: "active",
        plan,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        status: "active",
        plan,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/dashboard?subscribed=true`);
  } catch (error) {
    console.error("Callback error:", error);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/subscribe?error=activation_failed`);
  }
}
