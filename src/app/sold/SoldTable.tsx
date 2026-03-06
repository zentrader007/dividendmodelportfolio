"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatPercent, formatCurrency, formatDate, cn } from "@/lib/utils";

interface SoldRow {
  id: string;
  ticker: string;
  name: string | null;
  description: string | null;
  section: string | null;
  buyAlertDate: Date | string | null;
  buyAlertPrice: number | null;
  buyArticle: string | null;
  lastBuyUnder: number | null;
  sellAlertPrice: number | null;
  sellAlertDate: Date | string | null;
  sellArticle: string | null;
  ytdGain: number | null;
  totalGain: number | null;
  status: string | null;
  year: number;
}

const columns: Column<SoldRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "name", header: "Name", className: "max-w-[200px] truncate" },
  { key: "description", header: "Description", className: "max-w-[180px] truncate" },
  { key: "section", header: "Section" },
  { key: "buyAlertDate", header: "Buy Alert", render: (r) => formatDate(r.buyAlertDate) },
  { key: "buyAlertPrice", header: "Buy Price", render: (r) => formatCurrency(r.buyAlertPrice) },
  { key: "lastBuyUnder", header: "Last BU", render: (r) => formatCurrency(r.lastBuyUnder) },
  { key: "sellAlertPrice", header: "Sell Price", render: (r) => formatCurrency(r.sellAlertPrice) },
  { key: "sellAlertDate", header: "Sell Date", render: (r) => formatDate(r.sellAlertDate) },
  {
    key: "ytdGain",
    header: "YTD Gain",
    render: (r) => (
      <span className={cn(r.ytdGain != null && r.ytdGain >= 0 ? "positive" : "negative")}>
        {formatPercent(r.ytdGain)}
      </span>
    ),
  },
  {
    key: "totalGain",
    header: "Total Gain",
    render: (r) => (
      <span className={cn(r.totalGain != null && r.totalGain >= 0 ? "positive" : "negative")}>
        {formatPercent(r.totalGain)}
      </span>
    ),
  },
  { key: "status", header: "Status" },
];

export function SoldTable({ data, years }: { data: SoldRow[]; years: number[] }) {
  const [activeYear, setActiveYear] = useState(years[0] || 2026);

  const filtered = data.filter((r) => r.year === activeYear);

  return (
    <div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setActiveYear(year)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
              activeYear === year
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {year}
          </button>
        ))}
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={["ticker", "name", "description", "status"]}
      />
    </div>
  );
}
