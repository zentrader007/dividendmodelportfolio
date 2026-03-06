"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowClassName?: (row: T) => string;
  searchKeys?: string[];
  sectionKey?: string;
  sectionHeaders?: Record<string, string>;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  rowClassName,
  searchKeys = [],
  sectionKey,
  sectionHeaders,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Group by section if sectionKey provided
  const rows: { type: "header" | "data"; label?: string; row?: T }[] = [];
  if (sectionKey && sectionHeaders && !sortKey) {
    let currentSection = "";
    for (const row of sorted) {
      const section = row[sectionKey] as string;
      if (section && section !== currentSection) {
        currentSection = section;
        rows.push({ type: "header", label: sectionHeaders[section] || section });
      }
      rows.push({ type: "data", row });
    }
  } else {
    for (const row of sorted) {
      rows.push({ type: "data", row });
    }
  }

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search (ticker, name...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.headerClassName}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  {col.header}
                  {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, idx) =>
              item.type === "header" ? (
                <tr key={`section-${idx}`}>
                  <td colSpan={columns.length} className="section-header">
                    {item.label}
                  </td>
                </tr>
              ) : (
                <tr
                  key={idx}
                  className={cn(rowClassName?.(item.row!) )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render
                        ? col.render(item.row!)
                        : (item.row as any)[col.key] ?? ""}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs text-gray-500">{filtered.length} securities</div>
    </div>
  );
}
