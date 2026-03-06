"use client";

import { useState, useMemo } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatPercent, cn } from "@/lib/utils";

interface TaxRow {
  id: string;
  ticker: string;
  name: string | null;
  taxClass: string | null;
  year: number;
  ordinaryIncome: number | null;
  sec199aDeduction: number | null;
  qualifiedDividends: number | null;
  ltcg: number | null;
  returnOfCapital: number | null;
  companyLink: string | null;
}

const tabs = [
  { key: "alphabetical", label: "Alphabetical" },
  { key: "by-class", label: "By Tax Class" },
];

const columns: Column<TaxRow>[] = [
  { key: "taxClass", header: "Tax Class" },
  { key: "ticker", header: "Ticker", render: (r) => <span className="font-semibold text-blue-700">{r.ticker}</span> },
  { key: "name", header: "Name", className: "max-w-[200px] truncate" },
  { key: "year", header: "Year" },
  {
    key: "ordinaryIncome",
    header: "Ordinary Income",
    render: (r) => r.ordinaryIncome != null ? formatPercent(r.ordinaryIncome) : "",
  },
  {
    key: "sec199aDeduction",
    header: "199a Deduction",
    render: (r) => r.sec199aDeduction != null ? formatPercent(r.sec199aDeduction) : "",
  },
  {
    key: "qualifiedDividends",
    header: "QDI",
    render: (r) => r.qualifiedDividends != null ? formatPercent(r.qualifiedDividends) : "",
  },
  {
    key: "ltcg",
    header: "LTCG",
    render: (r) => r.ltcg != null ? formatPercent(r.ltcg) : "",
  },
  {
    key: "returnOfCapital",
    header: "Return of Capital",
    render: (r) => r.returnOfCapital != null ? formatPercent(r.returnOfCapital) : "",
  },
  {
    key: "companyLink",
    header: "Link",
    render: (r) =>
      r.companyLink ? (
        <a href={r.companyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          View
        </a>
      ) : (
        ""
      ),
  },
];

export function TaxTable({
  data,
  years,
  taxClasses,
}: {
  data: TaxRow[];
  years: number[];
  taxClasses: string[];
}) {
  const [activeTab, setActiveTab] = useState("alphabetical");

  const sorted = useMemo(() => {
    if (activeTab === "by-class") {
      return [...data].sort((a, b) => {
        const classA = a.taxClass || "";
        const classB = b.taxClass || "";
        if (classA !== classB) return classA.localeCompare(classB);
        return a.ticker.localeCompare(b.ticker);
      });
    }
    return [...data].sort((a, b) => {
      if (a.ticker !== b.ticker) return a.ticker.localeCompare(b.ticker);
      return b.year - a.year;
    });
  }, [data, activeTab]);

  const sectionHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    for (const tc of taxClasses) {
      headers[tc] = tc;
    }
    return headers;
  }, [taxClasses]);

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
        searchKeys={["ticker", "name", "taxClass"]}
        sectionKey={activeTab === "by-class" ? "taxClass" : undefined}
        sectionHeaders={activeTab === "by-class" ? sectionHeaders : undefined}
      />
    </div>
  );
}
