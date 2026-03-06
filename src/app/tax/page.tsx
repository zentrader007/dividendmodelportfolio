import { prisma } from "@/lib/db";
import { TaxTable } from "./TaxTable";

export const dynamic = "force-dynamic";

export default async function TaxPage() {
  const taxInfos = await prisma.taxInfo.findMany({
    orderBy: [{ ticker: "asc" }, { year: "desc" }],
  });

  const enriched = taxInfos.map((t) => ({
    id: t.id,
    ticker: t.ticker,
    name: t.name,
    taxClass: t.taxClass,
    year: t.year,
    ordinaryIncome: t.ordinaryIncome,
    sec199aDeduction: t.sec199aDeduction,
    qualifiedDividends: t.qualifiedDividends,
    ltcg: t.ltcg,
    returnOfCapital: t.returnOfCapital,
    companyLink: t.companyLink,
  }));

  // Get distinct years and taxClasses for rendering
  const yearSet = new Set<number>();
  enriched.forEach((t) => yearSet.add(t.year));
  const years = Array.from(yearSet).sort((a, b) => b - a);

  const classSet = new Set<string>();
  enriched.forEach((t) => { if (t.taxClass) classSet.add(t.taxClass); });
  const taxClasses = Array.from(classSet).sort();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tax Information</h1>
        <p className="text-sm text-gray-500">Income classifications and tax data by security</p>
      </div>
      <TaxTable data={enriched} years={years} taxClasses={taxClasses} />
    </div>
  );
}
