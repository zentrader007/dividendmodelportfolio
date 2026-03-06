"use client";

import { useState } from "react";
import { DataTable, Column } from "@/components/DataTable";
import { formatDate } from "@/lib/utils";

interface LogRow {
  id: string;
  revNumber: string | null;
  date: Date | string | null;
  ticker: string | null;
  changeType: string | null;
  note: string | null;
}

const columns: Column<LogRow>[] = [
  { key: "revNumber", header: "Rev#" },
  { key: "date", header: "Date", render: (r) => formatDate(r.date) },
  { key: "ticker", header: "Ticker", render: (r) => r.ticker ? <span className="font-semibold text-blue-700">{r.ticker}</span> : "" },
  { key: "changeType", header: "Type" },
  { key: "note", header: "Note", className: "max-w-[400px] truncate" },
];

interface LogClientProps {
  holdings: LogRow[];
  design: LogRow[];
}

export function LogClient({ holdings, design }: LogClientProps) {
  const [search, setSearch] = useState("");

  const filterData = (data: LogRow[]) => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter(
      (r) =>
        r.ticker?.toLowerCase().includes(q) ||
        r.note?.toLowerCase().includes(q) ||
        r.changeType?.toLowerCase().includes(q) ||
        r.revNumber?.toLowerCase().includes(q)
    );
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search log entries (ticker, note, type...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Holdings Changes</h2>
          <DataTable data={filterData(holdings)} columns={columns} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Design Revisions</h2>
          <DataTable data={filterData(design)} columns={columns} />
        </div>
      </div>
    </div>
  );
}
