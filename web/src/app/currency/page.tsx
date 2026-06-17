import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { CurrencySelector } from "@/components/currency-selector";
import { BankComparison } from "@/components/bank-comparison";
import {
  loadRates,
  getAllCurrencies,
  getRatesByCurrency,
  getLastScrapedDate,
} from "@/lib/data";

export const metadata: Metadata = {
  title: "Compare Forex Rates by Currency",
};

export default async function CurrencyPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const rates = loadRates();
  const currencies = getAllCurrencies(rates);
  const lastUpdated = getLastScrapedDate(rates);
  const selectedCode = params.code || "USD";
  const data = getRatesByCurrency(rates, selectedCode);
  const currencyName =
    currencies.find((c) => c.code === selectedCode)?.name ?? selectedCode;

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/currency" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
              Compare by Currency
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Compare forex rates across banks for a specific currency
            </p>
          </div>
          <Suspense>
            <CurrencySelector
              currencies={currencies}
              currentCode={selectedCode}
              basePath="/currency"
            />
          </Suspense>
        </div>

        {data.length > 0 ? (
          <BankComparison
            data={data}
            currencyCode={selectedCode}
            currencyName={currencyName}
          />
        ) : (
          <div className="rounded-md border border-border p-8 text-center">
            <p className="text-[14px] text-muted-foreground">
              No rates available for {selectedCode}
            </p>
          </div>
        )}
      </main>
    </>
  );
}
