import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FIVE_MINUTES = 5 * 60 * 1000;

async function fetchYahooQuotes(tickers: string[]) {
  const results: Record<string, { price: number; change: number }> = {};

  // Batch in groups of 20 to avoid URL length limits
  for (let i = 0; i < tickers.length; i += 20) {
    const batch = tickers.slice(i, i + 20);
    const symbols = batch.join(",");

    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChange`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        console.error(`Yahoo Finance API error: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const quotes = data?.quoteResponse?.result || [];

      for (const quote of quotes) {
        if (quote.symbol && quote.regularMarketPrice != null) {
          results[quote.symbol] = {
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange || 0,
          };
        }
      }
    } catch (err) {
      console.error(`Error fetching batch:`, err);
    }
  }

  return results;
}

export async function GET() {
  try {
    // Check if cache is fresh
    const latestCache = await prisma.priceCache.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    if (latestCache && Date.now() - latestCache.fetchedAt.getTime() < FIVE_MINUTES) {
      const cached = await prisma.priceCache.findMany();
      return NextResponse.json({
        source: "cache",
        prices: Object.fromEntries(cached.map((c) => [c.ticker, { price: c.price, change: c.dailyChange }])),
      });
    }

    // Get all tickers from securities + preferreds
    const securities = await prisma.security.findMany({ select: { ticker: true } });
    const preferreds = await prisma.preferred.findMany({ select: { ticker: true } });

    const allTickers = [
      ...securities.map((s) => s.ticker),
      ...preferreds.map((p) => p.ticker),
    ];

    // Fetch from Yahoo Finance
    const quotes = await fetchYahooQuotes(allTickers);

    // Update cache
    const now = new Date();
    for (const [ticker, data] of Object.entries(quotes)) {
      await prisma.priceCache.upsert({
        where: { ticker },
        update: { price: data.price, dailyChange: data.change, fetchedAt: now },
        create: { ticker, price: data.price, dailyChange: data.change, fetchedAt: now },
      });
    }

    return NextResponse.json({
      source: "yahoo",
      count: Object.keys(quotes).length,
      prices: quotes,
    });
  } catch (error) {
    console.error("Price fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}

export async function POST() {
  // Force refresh
  try {
    const securities = await prisma.security.findMany({ select: { ticker: true } });
    const preferreds = await prisma.preferred.findMany({ select: { ticker: true } });
    const allTickers = [...securities.map((s) => s.ticker), ...preferreds.map((p) => p.ticker)];
    const quotes = await fetchYahooQuotes(allTickers);

    const now = new Date();
    for (const [ticker, data] of Object.entries(quotes)) {
      await prisma.priceCache.upsert({
        where: { ticker },
        update: { price: data.price, dailyChange: data.change, fetchedAt: now },
        create: { ticker, price: data.price, dailyChange: data.change, fetchedAt: now },
      });
    }

    return NextResponse.json({ refreshed: Object.keys(quotes).length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh" }, { status: 500 });
  }
}
