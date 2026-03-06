"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/dashboard", label: "Portfolio" },
  { href: "/preferreds", label: "Preferreds" },
  { href: "/bonds", label: "Bonds" },
  { href: "/dividends", label: "Dividends" },
];

const moreLinks = [
  { href: "/sold", label: "Sold Securities" },
  { href: "/earnings", label: "Earnings Calendar" },
  { href: "/tax", label: "Tax Info" },
  { href: "/log", label: "Update Log" },
];

export function Navbar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="text-lg font-bold text-blue-700 mr-6">
              HDO Portfolio
            </Link>
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-link",
                  pathname === link.href && "nav-link-active"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={cn(
                  "nav-link",
                  moreLinks.some((l) => pathname === l.href) && "nav-link-active"
                )}
              >
                More ▾
              </button>
              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[180px]">
                    {moreLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
                          pathname === link.href && "bg-blue-50 text-blue-700"
                        )}
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-xs">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
