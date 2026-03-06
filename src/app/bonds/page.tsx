import { prisma } from "@/lib/db";
import { BondsTable } from "./BondsTable";

export const dynamic = "force-dynamic";

export default async function BondsPage() {
  const bonds = await prisma.bond.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const enriched = bonds.map((b) => ({
    cusip: b.cusip,
    name: b.name,
    coupon: b.coupon,
    currentYield: null as number | null, // price needed for coupon*100/price
    ytmYtc: null as number | null,
    risk: b.risk,
    creditRating: b.creditRating,
    suggestedAlloc: b.suggestedAlloc,
    callableDate: b.callableDate,
    callableText: b.callableText,
    maturityDate: b.maturityDate,
    price: null as number | null, // N/A until price fetching is added
    buyUnder: b.buyUnder,
    nextPayment: b.nextPayment,
    accruedInterest: null as number | null,
    sector: b.sector,
    articleLink: b.articleLink,
    prospectusLink: b.prospectusLink,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bonds</h1>
        <p className="text-sm text-gray-500">Baby Bonds and Traditional Bond Holdings</p>
      </div>
      <BondsTable data={enriched} />
    </div>
  );
}
