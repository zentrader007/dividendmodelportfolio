"use client";

import { DataTable, Column } from "@/components/DataTable";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DivEventRow {
  id: string;
  ticker: string;
  exDivDate: Date | string | null;
  amount: number | null;
  payDate: Date | string | null;
  declarationDate: Date | string | null;
}

interface BabyBondRow {
  ticker: string;
  name: string;
  divFreq: string | null;
  coupon: number | null;
  annualDiv: number | null;
  periodDiv: number | null;
  exDivDate: string | null;
  exDivMonths: string | null;
  payDate: string | null;
  payMonths: string | null;
  webLink: string | null;
}

const divColumns: Column<DivEventRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "exDivDate", header: "Ex-Div Date", render: (r) => formatDate(r.exDivDate) },
  { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount) },
  { key: "payDate", header: "Pay Date", render: (r) => formatDate(r.payDate) },
  { key: "declarationDate", header: "Declared", render: (r) => formatDate(r.declarationDate) },
];

const babyBondColumns: Column<BabyBondRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "name", header: "Name", className: "max-w-[200px] truncate" },
  { key: "divFreq", header: "Freq" },
  { key: "coupon", header: "Coupon", render: (r) => r.coupon != null ? `${r.coupon.toFixed(2)}%` : "" },
  { key: "annualDiv", header: "Annual Div", render: (r) => formatCurrency(r.annualDiv) },
  { key: "periodDiv", header: "Period Div", render: (r) => formatCurrency(r.periodDiv) },
  { key: "exDivDate", header: "Ex-Div Date" },
  { key: "exDivMonths", header: "Ex-Div Months" },
  { key: "payDate", header: "Pay Date" },
  { key: "payMonths", header: "Pay Months" },
  {
    key: "webLink",
    header: "Link",
    render: (r) =>
      r.webLink ? (
        <a href={r.webLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          View
        </a>
      ) : (
        ""
      ),
  },
];

interface DividendsClientProps {
  recent: DivEventRow[];
  upcoming: DivEventRow[];
  anticipated: DivEventRow[];
  babyBonds: BabyBondRow[];
}

export function DividendsClient({ recent, upcoming, anticipated, babyBonds }: DividendsClientProps) {
  return (
    <div className="space-y-8">
      {/* 3-panel dividend events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Recent Dividends</h2>
          <DataTable data={recent} columns={divColumns} searchKeys={["ticker"]} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Dividends</h2>
          <DataTable data={upcoming} columns={divColumns} searchKeys={["ticker"]} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Anticipated Dividends</h2>
          <DataTable data={anticipated} columns={divColumns} searchKeys={["ticker"]} />
        </div>
      </div>

      {/* Baby Bond Div table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Baby Bond Dividend Schedule</h2>
        <DataTable data={babyBonds} columns={babyBondColumns} searchKeys={["ticker", "name"]} />
      </div>
    </div>
  );
}
