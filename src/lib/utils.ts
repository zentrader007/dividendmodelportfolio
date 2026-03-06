import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return "N/A";
  return `$${value.toFixed(2)}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function calcDivYield(annualDiv: number | null, price: number | null): number | null {
  if (!annualDiv || !price || price === 0) return null;
  return annualDiv / price;
}

export function isBelowBuyUnder(price: number | null, buyUnder: number | null): boolean {
  if (!price || !buyUnder) return false;
  return price < buyUnder;
}

export function calcYtdGain(currentPrice: number | null, jan1Price: number | null, earnedYtd: number | null): number | null {
  if (!currentPrice || !jan1Price || jan1Price === 0) return null;
  return (currentPrice - jan1Price + (earnedYtd || 0)) / jan1Price;
}

export function calcTotalGain(currentPrice: number | null, alertPrice: number | null, earnedTotal: number | null): number | null {
  if (!currentPrice || !alertPrice || alertPrice === 0) return null;
  return (currentPrice - alertPrice + (earnedTotal || 0)) / alertPrice;
}

export function calcBondYield(coupon: number | null, price: number | null): number | null {
  if (!coupon || !price || price === 0) return null;
  return (coupon * 100) / price;
}

export function pctBelowBuyUnder(price: number | null, buyUnder: number | null): number | null {
  if (!price || !buyUnder || buyUnder === 0) return null;
  return (price - buyUnder) / buyUnder;
}
