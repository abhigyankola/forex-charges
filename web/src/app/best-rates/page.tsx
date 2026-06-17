import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { loadRates, getBestRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Best Forex Rates Today — Lowest Rates Across Banks",
};

export default function BestRatesPage() {
  const rates = loadRates();
  const bestRates = getBestRates(rates);
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/best-rates" />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Best Rates
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Find the best forex rates across all banks for major currencies
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bestRates.map((r) => {
            const buyDiff = r.best_buy_rate - r.worst_buy_rate;
            const sellDiff = r.worst_sell_rate - r.best_sell_rate;
            return (
              <div
                key={r.currency_code}
                className="rounded-md border border-border bg-card p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Link
                    href={`/currency?code=${r.currency_code}`}
                    className="hover:underline"
                  >
                    <span className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
                      {r.currency_code}
                    </span>
                    <span className="ml-2 text-[13px] font-normal text-muted-foreground">
                      {r.currency_name}
                    </span>
                  </Link>
                </div>

                <div className="space-y-3">
                  {r.best_buy_rate > 0 && (
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                          Best Buy
                        </span>
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {r.best_buy_bank}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                        ₹{r.best_buy_rate.toFixed(2)}
                      </p>
                      {buyDiff > 0 && (
                        <p className="mt-0.5 font-mono text-[12px] text-emerald-400">
                          +₹{buyDiff.toFixed(2)} vs worst
                        </p>
                      )}
                    </div>
                  )}

                  {r.best_sell_rate > 0 && (
                    <div className="rounded-md bg-secondary p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                          Best Sell
                        </span>
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {r.best_sell_bank}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[20px] font-semibold tracking-[-0.02em] text-foreground">
                        ₹{r.best_sell_rate.toFixed(2)}
                      </p>
                      {sellDiff > 0 && (
                        <p className="mt-0.5 font-mono text-[12px] text-emerald-400">
                          −₹{sellDiff.toFixed(2)} vs worst
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
