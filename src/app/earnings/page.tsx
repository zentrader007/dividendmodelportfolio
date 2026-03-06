import { prisma } from "@/lib/db";
import { EarningsTable } from "./EarningsTable";

export const dynamic = "force-dynamic";

export default async function EarningsPage() {
  const events = await prisma.earningsEvent.findMany({
    orderBy: { reportDate: "asc" },
  });

  const enriched = events.map((e) => ({
    id: e.id,
    ticker: e.ticker,
    reportDate: e.reportDate,
    timing: e.timing,
    notes: e.notes,
    fiscalNote: e.fiscalNote,
    isPast: e.reportDate ? new Date(e.reportDate) < new Date() : false,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings Calendar</h1>
        <p className="text-sm text-gray-500">Upcoming and past earnings report dates for portfolio holdings</p>
      </div>
      <EarningsTable data={enriched} />
    </div>
  );
}
