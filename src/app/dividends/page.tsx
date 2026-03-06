import { prisma } from "@/lib/db";
import { DividendsClient } from "./DividendsClient";

export const dynamic = "force-dynamic";

export default async function DividendsPage() {
  const [dividendEvents, babyBondDivs] = await Promise.all([
    prisma.dividendEvent.findMany({
      orderBy: { exDivDate: "desc" },
    }),
    prisma.babyBondDiv.findMany({
      orderBy: { ticker: "asc" },
    }),
  ]);

  const recent = dividendEvents
    .filter((e) => e.eventType === "recent")
    .map((e) => ({
      id: e.id,
      ticker: e.ticker,
      exDivDate: e.exDivDate,
      amount: e.amount,
      payDate: e.payDate,
      declarationDate: e.declarationDate,
    }));

  const upcoming = dividendEvents
    .filter((e) => e.eventType === "upcoming")
    .map((e) => ({
      id: e.id,
      ticker: e.ticker,
      exDivDate: e.exDivDate,
      amount: e.amount,
      payDate: e.payDate,
      declarationDate: e.declarationDate,
    }));

  const anticipated = dividendEvents
    .filter((e) => e.eventType === "anticipated")
    .map((e) => ({
      id: e.id,
      ticker: e.ticker,
      exDivDate: e.exDivDate,
      amount: e.amount,
      payDate: e.payDate,
      declarationDate: e.declarationDate,
    }));

  const babyBonds = babyBondDivs.map((b) => ({
    ticker: b.ticker,
    name: b.name,
    divFreq: b.divFreq,
    coupon: b.coupon,
    annualDiv: b.annualDiv,
    periodDiv: b.periodDiv,
    exDivDate: b.exDivDate,
    exDivMonths: b.exDivMonths,
    payDate: b.payDate,
    payMonths: b.payMonths,
    webLink: b.webLink,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dividend Tracker</h1>
        <p className="text-sm text-gray-500">Recent, Upcoming, and Anticipated Dividend Events</p>
      </div>
      <DividendsClient
        recent={recent}
        upcoming={upcoming}
        anticipated={anticipated}
        babyBonds={babyBonds}
      />
    </div>
  );
}
