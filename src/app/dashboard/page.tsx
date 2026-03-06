import { prisma } from "@/lib/db";
import { formatPercent, formatCurrency, calcDivYield, isBelowBuyUnder, calcYtdGain, calcTotalGain, pctBelowBuyUnder } from "@/lib/utils";
import { StatCard } from "@/components/StatCard";
import { PortfolioTable } from "./PortfolioTable";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const securities = await prisma.security.findMany({
    include: { dividendData: true, priceCache: true },
    orderBy: { sortOrder: "asc" },
  });

  const enriched = securities.map((s) => {
    const price = s.priceCache?.price ?? null;
    const annualDiv = s.dividendData?.annualDiv ?? null;
    const earnedYtd = s.dividendData?.earnedYtd ?? null;
    const earnedTotal = s.dividendData?.earnedTotal ?? null;

    return {
      ticker: s.ticker,
      name: s.name,
      divYield: calcDivYield(annualDiv, price),
      divFreq: s.divFreq,
      risk: s.risk,
      issuesK1: s.issuesK1,
      suggestedAlloc: s.suggestedAlloc,
      maxAlloc: s.maxAlloc,
      description: s.description,
      price,
      buyUnder: s.buyUnder,
      buyUnderText: s.buyUnderText,
      belowBU: isBelowBuyUnder(price, s.buyUnder),
      pctBelowBU: pctBelowBuyUnder(price, s.buyUnder),
      alertDate: s.alertDate,
      alertPrice: s.alertPrice,
      articleLink: s.articleLink,
      ytdGain: calcYtdGain(price, s.jan1Price, earnedYtd),
      totalGain: calcTotalGain(price, s.alertPrice, earnedTotal),
      dailyChange: s.priceCache?.dailyChange ?? null,
      sector: s.sector,
      portfolioSection: s.portfolioSection,
      notes: s.notes,
    };
  });

  const totalHoldings = enriched.length;
  const belowBUCount = enriched.filter((s) => s.belowBU).length;
  const avgYield = enriched.reduce((sum, s) => sum + (s.divYield || 0), 0) / (totalHoldings || 1);
  const totalDailyChange = enriched.reduce((sum, s) => sum + (s.dailyChange || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HDO Model Portfolio</h1>
          <p className="text-sm text-gray-500">High Dividend Opportunities</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Rev# 2.29.09</p>
          <p>Published Mar 1, 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Avg Dividend Yield" value={formatPercent(avgYield)} />
        <StatCard label="Total Holdings" value={String(totalHoldings)} />
        <StatCard label="Below Buy Under" value={String(belowBUCount)} subtitle={`of ${totalHoldings} securities`} />
        <StatCard
          label="Daily Change"
          value={totalDailyChange >= 0 ? `+${totalDailyChange.toFixed(2)}` : totalDailyChange.toFixed(2)}
          className={totalDailyChange >= 0 ? "border-green-200" : "border-red-200"}
        />
      </div>

      <PortfolioTable data={enriched} />
    </div>
  );
}
