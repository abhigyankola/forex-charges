import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { BankSelector } from "@/components/bank-selector";
import { BankRateTable } from "@/components/bank-rate-table";
import {
  loadRates,
  getAllBanks,
  getRatesByBank,
  getLastScrapedDate,
} from "@/lib/data";
import { TransactionType } from "@/lib/types";

function groupByCurrency(
  rates: { currency_code: string; currency_name: string; transaction_type: TransactionType; rate: number }[]
) {
  const map = new Map<
    string,
    { currency_code: string; currency_name: string; rates: Record<string, number> }
  >();
  for (const r of rates) {
    if (!map.has(r.currency_code)) {
      map.set(r.currency_code, {
        currency_code: r.currency_code,
        currency_name: r.currency_name,
        rates: {},
      });
    }
    map.get(r.currency_code)!.rates[r.transaction_type] = r.rate;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.currency_code.localeCompare(b.currency_code)
  );
}

export const metadata: Metadata = {
  title: "Forex Rates by Bank",
};

export default async function BankPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const params = await searchParams;
  const rates = loadRates();
  const banks = getAllBanks(rates);
  const lastUpdated = getLastScrapedDate(rates);
  const selectedBank = params.name || banks[0] || "HSBC";
  const bankRates = getRatesByBank(rates, selectedBank);
  const grouped = groupByCurrency(bankRates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/bank" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
              {selectedBank}
            </h1>
            <p className="mt-1 text-[14px] text-muted-foreground">
              All forex rates for {selectedBank} across {grouped.length}{" "}
              currencies
            </p>
          </div>
          <Suspense>
            <BankSelector
              banks={banks}
              currentBank={selectedBank}
              basePath="/bank"
            />
          </Suspense>
        </div>

        <BankRateTable grouped={grouped} />
      </main>
    </>
  );
}
