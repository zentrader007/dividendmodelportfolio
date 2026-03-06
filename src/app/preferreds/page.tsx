import { prisma } from "@/lib/db";
import { PreferredsTable } from "./PreferredsTable";

export const dynamic = "force-dynamic";

export default async function PreferredsPage() {
  const preferreds = await prisma.preferred.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const enriched = preferreds.map((p) => ({
    ticker: p.ticker,
    name: p.name,
    couponRate: p.couponRate,
    currentYield: p.couponRate ? (p.couponRate * 25) / 25 : null, // price placeholder — will use real price later
    ytc: null as number | null,
    ytm: null as number | null,
    price: null as number | null, // N/A until price fetching is added
    buyUnder: p.buyUnder,
    risk: p.risk,
    creditRating: p.creditRating,
    callDate: p.callDate,
    maturityDate: p.maturityDate,
    qdi: p.qdi,
    k1: p.k1,
    alertDate: p.alertDate,
    alertPrice: p.alertPrice,
    jan1Price: p.jan1Price,
    category: p.category,
    articleLink: p.articleLink,
    notes: p.notes,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preferred Stocks</h1>
        <p className="text-sm text-gray-500">Term Preferreds, Fixed Perpetuals, Floating Rate, and Convertibles</p>
      </div>
      <PreferredsTable data={enriched} />
    </div>
  );
}
