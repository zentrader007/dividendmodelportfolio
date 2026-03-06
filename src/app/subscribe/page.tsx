"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (plan: string) => {
    setLoading(plan);
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(null);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError("Failed to start checkout");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-2">Subscribe to HDO Portfolio</h1>
        <p className="text-center text-gray-500 mb-8">
          Get full access to the HDO Model Portfolio, live prices, dividend tracking, and more.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Monthly</h2>
            <p className="text-3xl font-bold mt-2">
              $9.99<span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Full portfolio access</li>
              <li>Live stock prices</li>
              <li>Dividend tracker</li>
              <li>Cancel anytime</li>
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loading !== null}
              className={cn("w-full mt-6 btn-secondary py-2.5", loading === "monthly" && "opacity-50")}
            >
              {loading === "monthly" ? "Redirecting..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Annual */}
          <div className="bg-white border-2 border-blue-500 rounded-lg p-6 shadow-md relative">
            <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
              Best Value
            </span>
            <h2 className="text-lg font-semibold">Annual</h2>
            <p className="text-3xl font-bold mt-2">
              $99<span className="text-sm font-normal text-gray-500">/yr</span>
            </p>
            <p className="text-xs text-green-600 font-medium">Save 17%</p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>Everything in Monthly</li>
              <li>2 months free</li>
              <li>Priority support</li>
              <li>Tax info reports</li>
            </ul>
            <button
              onClick={() => handleSubscribe("annual")}
              disabled={loading !== null}
              className={cn("w-full mt-6 btn-primary py-2.5", loading === "annual" && "opacity-50")}
            >
              {loading === "annual" ? "Redirecting..." : "Subscribe Annual"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
