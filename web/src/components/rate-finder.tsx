"use client";

import { useState } from "react";
import { BankCurrencyRates } from "@/lib/types";

type Purpose = "send" | "receive" | "card" | "cash_buy" | "cash_sell";

const PURPOSES: { id: Purpose; label: string; description: string }[] = [
  { id: "send", label: "Send money abroad", description: "Wire transfer / remittance to another country" },
  { id: "receive", label: "Receive money from abroad", description: "Inward remittance from overseas" },
  { id: "card", label: "Load forex card for travel", description: "Prepaid forex card for international trips" },
  { id: "cash_buy", label: "Buy foreign currency cash", description: "Physical notes for travel or expenses" },
  { id: "cash_sell", label: "Sell foreign currency cash", description: "Convert leftover foreign notes to INR" },
];

function getRateKey(purpose: Purpose): keyof BankCurrencyRates {
  switch (purpose) {
    case "send": return "tt_sell";
    case "receive": return "tt_buy";
    case "card": return "card_sell";
    case "cash_buy": return "cash_sell";
    case "cash_sell": return "cash_buy";
  }
}

function isBuyDirection(purpose: Purpose): boolean {
  return purpose === "receive" || purpose === "cash_sell";
}

interface FinderProps {
  allData: Record<string, BankCurrencyRates[]>;
  currencies: { code: string; name: string }[];
}

export function RateFinder({ allData, currencies }: FinderProps) {
  const [step, setStep] = useState(0);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [amount, setAmount] = useState("100000");
  const [currencySearch, setCurrencySearch] = useState("");

  const POPULAR = ["USD", "EUR", "GBP", "AED", "SGD", "CAD", "AUD"];

  const filteredCurrencies = currencySearch
    ? currencies.filter(
        (c) =>
          c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
          c.name.toLowerCase().includes(currencySearch.toLowerCase())
      )
    : [
        ...currencies.filter((c) => POPULAR.includes(c.code)).sort(
          (a, b) => POPULAR.indexOf(a.code) - POPULAR.indexOf(b.code)
        ),
        ...currencies.filter((c) => !POPULAR.includes(c.code)),
      ];

  function reset() {
    setStep(0);
    setPurpose(null);
    setCurrency(null);
    setAmount("100000");
    setCurrencySearch("");
  }

  const numAmount = parseFloat(amount.replace(/,/g, "")) || 0;

  const results = (() => {
    if (!purpose || !currency || !allData[currency]) return [];
    const rateKey = getRateKey(purpose);
    const data = allData[currency];
    const buying = isBuyDirection(purpose);

    return data
      .filter((d) => {
        const val = d[rateKey] as number | undefined;
        return val != null && val > 0;
      })
      .map((d) => {
        const rate = d[rateKey] as number;
        const converted = buying ? numAmount * rate : numAmount / rate;
        return { bank: d.bank_name, rate, converted };
      })
      .sort((a, b) => {
        if (buying) return b.rate - a.rate;
        return a.rate - b.rate;
      });
  })();

  const bestRate = results[0]?.rate ?? 0;
  const worstRate = results[results.length - 1]?.rate ?? 0;

  function formatNum(n: number): string {
    return n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-foreground" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Step 0: Purpose */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
              What do you want to do?
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              We&apos;ll find the best bank rate for your specific need
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {PURPOSES.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPurpose(p.id);
                  setStep(1);
                }}
                className={`rounded-lg border p-4 text-left transition-all hover:border-foreground/30 hover:bg-accent ${
                  purpose === p.id
                    ? "border-foreground bg-accent"
                    : "border-border"
                }`}
              >
                <p className="text-[14px] font-medium text-foreground">{p.label}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{p.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Currency */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                Which currency?
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Select the foreign currency you&apos;re dealing with
              </p>
            </div>
            <button
              onClick={() => setStep(0)}
              className="text-[12px] text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
          </div>
          <input
            type="text"
            placeholder="Search currency (e.g. USD, Dirham, Pound)..."
            value={currencySearch}
            onChange={(e) => setCurrencySearch(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <div className="grid max-h-64 gap-1.5 overflow-y-auto sm:grid-cols-3">
            {filteredCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code);
                  setStep(2);
                }}
                className={`rounded-md border px-3 py-2 text-left transition-all hover:border-foreground/30 hover:bg-accent ${
                  currency === c.code
                    ? "border-foreground bg-accent"
                    : "border-border"
                }`}
              >
                <span className="font-mono text-[13px] font-medium text-foreground">{c.code}</span>
                <span className="ml-2 text-[12px] text-muted-foreground">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Amount + Results */}
      {step === 2 && purpose && currency && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                Best banks for you
              </h2>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {PURPOSES.find((p) => p.id === purpose)?.label} • {currency}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="text-[12px] text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <button
                onClick={reset}
                className="rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Start over
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground">Amount:</span>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">
                {isBuyDirection(purpose) ? currency : "₹"}
              </span>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ""))}
                className="h-9 w-40 rounded-md border border-border bg-background pl-8 pr-3 text-right font-mono text-[13px] text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-md border border-border p-6 text-center">
              <p className="text-[13px] text-muted-foreground">
                No banks have rates available for this combination
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => {
                const isBest = i === 0;
                const savings = isBuyDirection(purpose)
                  ? (r.rate - worstRate) * numAmount
                  : numAmount / r.rate - numAmount / worstRate;

                return (
                  <div
                    key={r.bank}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      isBest
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                        isBest
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[14px] font-medium text-foreground">{r.bank}</p>
                        <p className="text-[12px] text-muted-foreground">
                          Rate: ₹{r.rate.toFixed(2)} per {currency}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[15px] font-semibold text-foreground">
                        {isBuyDirection(purpose) ? "₹" : currency + " "}{formatNum(r.converted)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
