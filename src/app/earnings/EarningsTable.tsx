"use client";

import { useState, useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatDate, cn } from "@/lib/utils";

interface EarningsRow {
  id: string;
  ticker: string;
  reportDate: Date | string | null;
  timing: string | null;
  notes: string | null;
  fiscalNote: string | null;
  isPast: boolean;
}

const tabs = [
  { key: "by-date", label: "By Date" },
  { key: "by-ticker", label: "By Ticker" },
];

const columns: Column<EarningsRow>[] = [
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "reportDate", header: "Report Date", render: (r) => formatDate(r.reportDate) },
  { key: "timing", header: "Timing" },
  { key: "notes", header: "Notes", className: "max-w-[300px] truncate" },
  { key: "fiscalNote", header: "Fiscal Note", className: "max-w-[200px] truncate" },
];

export function EarningsTable({ data }: { data: EarningsRow[] }) {
  const [activeTab, setActiveTab] = useState("by-date");

  const sorted = useMemo(() => {
    if (activeTab === "by-ticker") {
      return [...data].sort((a, b) => a.ticker.localeCompare(b.ticker));
    }
    return data; // already sorted by date from server
  }, [data, activeTab]);

  return (
    <div>
      <div className="flex gap-1 mb-4">
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
        data={sorted}
        columns={columns}
        searchKeys={["ticker", "notes", "timing"]}
        rowClassName={(r) => (r.isPast ? "reported-row" : "")}
      />
    </div>
  );
}
