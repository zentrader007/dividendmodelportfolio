import { prisma } from "@/lib/db";
import { LogClient } from "./LogClient";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const logs = await prisma.updateLog.findMany({
    orderBy: { date: "desc" },
  });

  const holdingsChanges = logs
    .filter((l) => !l.isDesign)
    .map((l) => ({
      id: l.id,
      revNumber: l.revNumber,
      date: l.date,
      ticker: l.ticker,
      changeType: l.changeType,
      note: l.note,
    }));

  const designRevisions = logs
    .filter((l) => l.isDesign)
    .map((l) => ({
      id: l.id,
      revNumber: l.revNumber,
      date: l.date,
      ticker: l.ticker,
      changeType: l.changeType,
      note: l.note,
    }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Log</h1>
        <p className="text-sm text-gray-500">Portfolio changes and design revisions history</p>
      </div>
      <LogClient holdings={holdingsChanges} design={designRevisions} />
    </div>
  );
}
