import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Square checkout link creation
// Requires SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID env vars
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json(); // "monthly" or "annual"

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID;

    if (!accessToken || !locationId) {
      return NextResponse.json({ error: "Square not configured" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create a Square checkout link
    const amount = plan === "annual" ? 9900 : 999; // $99/year or $9.99/month in cents
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutRes = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Square-Version": "2024-01-18",
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: `${user.id}-${plan}-${Date.now()}`,
        quick_pay: {
          name: `HDO Portfolio - ${plan === "annual" ? "Annual" : "Monthly"} Subscription`,
          price_money: {
            amount,
            currency: "USD",
          },
          location_id: locationId,
        },
        checkout_options: {
          redirect_url: `${baseUrl}/api/subscribe/callback?userId=${user.id}&plan=${plan}`,
        },
      }),
    });

    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok) {
      console.error("Square checkout error:", checkoutData);
      return NextResponse.json({ error: "Payment setup failed" }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: checkoutData.payment_link?.url || checkoutData.payment_link?.long_url,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Subscription failed" }, { status: 500 });
  }
}
