"use client";

import { useState } from "react";
import { BankCurrencyRates } from "@/lib/types";

export function Calculator({
  data,
  currencyCode,
}: {
  data: BankCurrencyRates[];
  currencyCode: string;
}) {
  const [amount, setAmount] = useState<string>("100000");
  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;

  const buyResults = data
    .filter((d) => d.tt_sell != null && d.tt_sell > 0)
    .map((d) => ({
      bank: d.bank_name,
      rate: d.tt_sell!,
      get: numAmount / d.tt_sell!,
    }))
    .sort((a, b) => b.get - a.get);

  const sellResults = data
    .filter((d) => d.tt_buy != null && d.tt_buy > 0)
    .map((d) => ({
      bank: d.bank_name,
      rate: d.tt_buy!,
      get: numAmount * d.tt_buy!,
    }))
    .sort((a, b) => b.get - a.get);

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const results = mode === "buy" ? buyResults : sellResults;
  const bestAmount = results[0]?.get ?? 0;

  function formatINR(n: number): string {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  function formatFx(n: number): string {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <h3 className="text-[14px] font-semibold text-foreground">
        How much will I get?
      </h3>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex rounded-md border border-border bg-background">
          <button
            onClick={() => setMode("buy")}
            className={`px-3 py-2 text-[12px] font-medium transition-colors ${
              mode === "buy"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            } rounded-l-md`}
          >
            I want to buy {currencyCode}
          </button>
          <button
            onClick={() => setMode("sell")}
            className={`px-3 py-2 text-[12px] font-medium transition-colors ${
              mode === "sell"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            } rounded-r-md`}
          >
            I want to sell {currencyCode}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[13px] text-muted-foreground">
            {mode === "buy" ? "I have" : "I have"}
          </span>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
              {mode === "buy" ? "₹" : currencyCode}
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
              className="h-9 w-36 rounded-md border border-border bg-background pl-7 pr-3 text-right font-mono text-[13px] text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {results.length > 0 && numAmount > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => {
            const diff = mode === "buy"
              ? r.get - (results[results.length - 1]?.get ?? 0)
              : r.get - (results[results.length - 1]?.get ?? 0);
            const isBest = i === 0;
            return (
              <div
                key={r.bank}
                className={`flex items-center justify-between rounded-md px-3 py-2 ${
                  isBest ? "border border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20" : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isBest && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                      BEST
                    </span>
                  )}
                  <span className="text-[13px] font-medium text-foreground">
                    {r.bank}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[14px] font-semibold text-foreground">
                    {mode === "buy" ? currencyCode : "₹"} {formatFx(r.get)}
                  </span>
                  {isBest && results.length > 1 && (
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Save {mode === "buy" ? currencyCode : "₹"} {formatFx(diff)} vs worst
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
