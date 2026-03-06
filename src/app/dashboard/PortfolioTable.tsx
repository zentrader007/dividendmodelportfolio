"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatPercent, formatCurrency, cn } from "@/lib/utils";

interface PortfolioRow {
  ticker: string;
  name: string;
  divYield: number | null;
  divFreq: string | null;
  risk: string | null;
  issuesK1: boolean;
  suggestedAlloc: number | null;
  maxAlloc: number | null;
  description: string | null;
  price: number | null;
  buyUnder: number | null;
  buyUnderText: string | null;
  belowBU: boolean;
  pctBelowBU: number | null;
  alertPrice: number | null;
  ytdGain: number | null;
  totalGain: number | null;
  dailyChange: number | null;
  sector: string | null;
  portfolioSection: string | null;
  articleLink: string | null;
  notes: string | null;
}

const tabs = [
  { key: "all", label: "All" },
  { key: "Core 1", label: "Core 1 — Funds (~40%)" },
  { key: "Core 2", label: "Core 2 — Stocks (~30%)" },
  { key: "Cons 1", label: "Conservative — Preferreds" },
  { key: "Cons 2", label: "Conservative — Baby Bonds" },
  { key: "Cons 3", label: "Conservative — Bonds" },
];

const columns: Column<PortfolioRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "name", header: "Name", className: "max-w-[250px] truncate" },
  {
    key: "divYield",
    header: "Div Yield",
    render: (r) => <span>{formatPercent(r.divYield)}</span>,
  },
  { key: "divFreq", header: "Freq" },
  { key: "risk", header: "Risk" },
  {
    key: "suggestedAlloc",
    header: "Alloc",
    render: (r) => formatPercent(r.suggestedAlloc),
  },
  {
    key: "price",
    header: "Price",
    render: (r) => formatCurrency(r.price),
  },
  {
    key: "buyUnder",
    header: "Buy Under",
    render: (r) => r.buyUnderText || formatCurrency(r.buyUnder),
  },
  {
    key: "belowBU",
    header: "Below BU?",
    render: (r) =>
      r.belowBU ? (
        <span className="text-green-700 font-semibold">Yes</span>
      ) : r.buyUnderText ? (
        <span className="text-gray-400">{r.buyUnderText}</span>
      ) : (
        ""
      ),
  },
  {
    key: "ytdGain",
    header: "YTD Gain",
    render: (r) => (
      <span className={cn(r.ytdGain && r.ytdGain >= 0 ? "positive" : "negative")}>
        {formatPercent(r.ytdGain)}
      </span>
    ),
  },
  {
    key: "totalGain",
    header: "Total Gain",
    render: (r) => (
      <span className={cn(r.totalGain && r.totalGain >= 0 ? "positive" : "negative")}>
        {formatPercent(r.totalGain)}
      </span>
    ),
  },
  {
    key: "dailyChange",
    header: "Daily Δ",
    render: (r) =>
      r.dailyChange != null ? (
        <span className={cn(r.dailyChange >= 0 ? "positive" : "negative")}>
          {r.dailyChange >= 0 ? "+" : ""}{r.dailyChange.toFixed(4)}
        </span>
      ) : (
        ""
      ),
  },
  { key: "sector", header: "Sector" },
];

export function PortfolioTable({ data }: { data: PortfolioRow[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? data : data.filter((r) => r.portfolioSection === activeTab);

  return (
    <div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md font-medium transition-colors",
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <DataTable
        data={filtered}
        columns={columns}
        searchKeys={["ticker", "name", "description", "sector"]}
        rowClassName={(r) => (r.belowBU ? "buy-signal-row" : "")}
        sectionKey={activeTab === "all" ? "portfolioSection" : undefined}
        sectionHeaders={{
          "Core 1": "Core Portfolio Section 1 — Traded Funds (~40% Allocation)",
          "Core 2": "Core Portfolio Section 2 — Stocks (~30% Allocation)",
          "Cons 1": "Conservative Section 1 — Preferred Shares",
          "Cons 2": "Conservative Section 2 — Baby Bonds",
          "Cons 3": "Conservative Section 3 — Traditional Bonds",
        }}
      />
    </div>
  );
}
