import { prisma } from "@/lib/db";
import { SoldTable } from "./SoldTable";

export const dynamic = "force-dynamic";

export default async function SoldPage() {
  const soldSecurities = await prisma.soldSecurity.findMany({
    orderBy: [{ year: "desc" }, { sellAlertDate: "desc" }],
  });

  const enriched = soldSecurities.map((s) => ({
    id: s.id,
    ticker: s.ticker,
    name: s.name,
    description: s.description,
    section: s.section,
    buyAlertDate: s.buyAlertDate,
    buyAlertPrice: s.buyAlertPrice,
    buyArticle: s.buyArticle,
    lastBuyUnder: s.lastBuyUnder,
    sellAlertPrice: s.sellAlertPrice,
    sellAlertDate: s.sellAlertDate,
    sellArticle: s.sellArticle,
    ytdGain: s.ytdGain,
    totalGain: s.totalGain,
    status: s.status,
    year: s.year,
  }));

  // Get distinct years for tabs
  const yearSet = new Set<number>();
  enriched.forEach((s) => yearSet.add(s.year));
  const years = Array.from(yearSet).sort((a, b) => b - a);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sold Securities</h1>
        <p className="text-sm text-gray-500">Securities removed from the Model Portfolio</p>
      </div>
      <SoldTable data={enriched} years={years} />
    </div>
  );
}
