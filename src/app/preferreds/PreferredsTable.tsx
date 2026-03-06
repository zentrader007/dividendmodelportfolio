"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatPercent, formatCurrency, formatDate, cn } from "@/lib/utils";

interface PreferredRow {
  ticker: string;
  name: string;
  couponRate: number | null;
  currentYield: number | null;
  ytc: number | null;
  ytm: number | null;
  price: number | null;
  buyUnder: number | null;
  risk: string | null;
  creditRating: string | null;
  callDate: Date | string | null;
  maturityDate: Date | string | null;
  qdi: string | null;
  k1: string | null;
  alertDate: Date | string | null;
  alertPrice: number | null;
  jan1Price: number | null;
  category: string | null;
  articleLink: string | null;
  notes: string | null;
}

const tabs = [
  { key: "all", label: "All" },
  { key: "term-preferred", label: "Term Preferred" },
  { key: "fixed-perpetual", label: "Fixed Perpetual" },
  { key: "float-rate", label: "Floating Rate" },
  { key: "convertible", label: "Convertible" },
];

const columns: Column<PreferredRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "name", header: "Name", className: "max-w-[220px] truncate" },
  {
    key: "currentYield",
    header: "Cur Yield",
    render: (r) => r.price ? formatPercent((r.couponRate || 0) * 25 / r.price / 100) : "N/A",
  },
  { key: "ytc", header: "YTC", render: (r) => r.ytc != null ? formatPercent(r.ytc) : "N/A" },
  { key: "ytm", header: "YTM", render: (r) => r.ytm != null ? formatPercent(r.ytm) : "N/A" },
  { key: "price", header: "Price", render: (r) => r.price != null ? formatCurrency(r.price) : "N/A" },
  { key: "buyUnder", header: "Buy Under", render: (r) => formatCurrency(r.buyUnder) },
  { key: "risk", header: "Risk" },
  { key: "creditRating", header: "Rating" },
  { key: "couponRate", header: "Coupon", render: (r) => r.couponRate != null ? `${r.couponRate.toFixed(2)}%` : "" },
  { key: "callDate", header: "Call Date", render: (r) => formatDate(r.callDate) },
  { key: "maturityDate", header: "Maturity", render: (r) => formatDate(r.maturityDate) },
  { key: "qdi", header: "QDI" },
  { key: "k1", header: "K-1" },
];

export function PreferredsTable({ data }: { data: PreferredRow[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered = activeTab === "all" ? data : data.filter((r) => r.category === activeTab);

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
        searchKeys={["ticker", "name", "creditRating"]}
      />
    </div>
  );
}
