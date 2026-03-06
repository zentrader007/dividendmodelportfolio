"use client";

import { DataTable, Column } from "@/components/DataTable";
import { formatPercent, formatCurrency, formatDate } from "@/lib/utils";

interface BondRow {
  cusip: string;
  name: string;
  coupon: number | null;
  currentYield: number | null;
  ytmYtc: number | null;
  risk: string | null;
  creditRating: string | null;
  suggestedAlloc: number | null;
  callableDate: Date | string | null;
  callableText: string | null;
  maturityDate: Date | string | null;
  price: number | null;
  buyUnder: number | null;
  nextPayment: Date | string | null;
  accruedInterest: number | null;
  sector: string | null;
  articleLink: string | null;
  prospectusLink: string | null;
}

const columns: Column<BondRow>[] = [
  { key: "cusip", header: "CUSIP", render: (r) => <span className="font-semibold text-blue-700">{r.cusip}</span> },
  { key: "name", header: "Name", className: "max-w-[220px] truncate" },
  {
    key: "currentYield",
    header: "Cur Yield",
    render: (r) => r.price && r.coupon ? formatPercent((r.coupon * 100) / r.price / 100) : "N/A",
  },
  { key: "ytmYtc", header: "YTM/YTC", render: (r) => r.ytmYtc != null ? formatPercent(r.ytmYtc) : "N/A" },
  { key: "risk", header: "Risk" },
  { key: "coupon", header: "Coupon", render: (r) => r.coupon != null ? `${r.coupon.toFixed(3)}%` : "" },
  { key: "creditRating", header: "Rating" },
  { key: "suggestedAlloc", header: "Alloc", render: (r) => formatPercent(r.suggestedAlloc) },
  {
    key: "callableDate",
    header: "Callable",
    render: (r) => r.callableText || formatDate(r.callableDate),
  },
  { key: "maturityDate", header: "Maturity", render: (r) => formatDate(r.maturityDate) },
  { key: "price", header: "Price", render: (r) => r.price != null ? formatCurrency(r.price) : "N/A" },
  { key: "buyUnder", header: "Buy Under", render: (r) => formatCurrency(r.buyUnder) },
  { key: "nextPayment", header: "Next Payment", render: (r) => formatDate(r.nextPayment) },
  { key: "accruedInterest", header: "Accrued Int", render: (r) => r.accruedInterest != null ? formatCurrency(r.accruedInterest) : "N/A" },
];

export function BondsTable({ data }: { data: BondRow[] }) {
  return (
    <DataTable
      data={data}
      columns={columns}
      searchKeys={["cusip", "name", "creditRating", "sector"]}
    />
  );
}
