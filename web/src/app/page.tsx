import Link from "next/link";
import { Nav } from "@/components/nav";
import { RateFinder } from "@/components/rate-finder";
import {
  loadRates,
  getAllBanks,
  getAllCurrencies,
  getRatesByCurrency,
  getLastScrapedDate,
  getBankStats,
} from "@/lib/data";

export default function DashboardPage() {
  const rates = loadRates();
  const banks = getAllBanks(rates);
  const currencies = getAllCurrencies(rates);
  const lastUpdated = getLastScrapedDate(rates);
  const bankStats = getBankStats(rates);

  const allData: Record<string, ReturnType<typeof getRatesByCurrency>> = {};
  for (const c of currencies) {
    allData[c.code] = getRatesByCurrency(rates, c.code);
  }

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Find the Best Forex Rate
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Answer a few questions to find which bank gives you the best deal
          </p>
        </div>

        <div className="mx-auto mb-10 max-w-2xl">
          <RateFinder allData={allData} currencies={currencies} />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-[16px] font-semibold tracking-[-0.03em] text-foreground">
            Banks
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bankStats.map((bank) => (
              <Link
                key={bank.bank_name}
                href={`/bank?name=${bank.bank_name}`}
                className="group rounded-md border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground group-hover:underline">
                  {bank.bank_name}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {bank.rate_count} rates
                  </span>
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {bank.currency_count} currencies
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <section className="mt-12 border-t border-border pt-10">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-[16px] font-semibold tracking-[-0.03em] text-foreground">
              <svg className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Learn more about forex rates in India
            </summary>
            <div className="mt-4 space-y-4 text-[14px] leading-relaxed text-muted-foreground">
              <p>
                Finding the best foreign exchange rate can save you a significant amount of money,
                whether you&apos;re sending a remittance abroad, buying forex for travel, or loading
                a forex card. Indian banks each publish their own exchange rates daily, but comparing
                them manually across multiple bank websites is time-consuming and tedious. Forex Rates
                India solves this by aggregating rates from major Indian banks into a single,
                easy-to-use comparison tool.
              </p>

              <h3 className="text-[16px] font-semibold text-foreground">
                Banks We Cover
              </h3>
              <p>
                We track forex rates from HSBC, ICICI Bank, Axis Bank, IDFC First Bank, Indian
                Overseas Bank (IOB), Kotak Mahindra Bank, State Bank of India (SBI), and HDFC Bank.
                These banks collectively serve hundreds of millions of customers and are the most
                commonly used for international remittances, forex cards, and currency exchange in
                India.
              </p>

              <h3 className="text-[16px] font-semibold text-foreground">
                Understanding Forex Rate Types
              </h3>
              <p>
                <strong className="text-foreground">TT (Telegraphic Transfer)</strong>{" "}
                rates apply to electronic wire transfers — this is the rate you&apos;ll get when
                sending money abroad or receiving an inward remittance.{" "}
                <strong className="text-foreground">Card rates</strong> apply to forex card
                transactions and debit/credit card usage abroad.{" "}
                <strong className="text-foreground">Cash rates</strong> are for buying or selling
                physical foreign currency notes.{" "}
                <strong className="text-foreground">Bills rates</strong> apply to foreign-currency
                instruments like cheques and demand drafts.
              </p>

              <h3 className="text-[16px] font-semibold text-foreground">
                Updated Daily
              </h3>
              <p>
                All rates on this website are updated daily from official bank sources. While rates
                are indicative and the actual rate at the time of your transaction may vary slightly,
                this tool gives you a reliable baseline for comparison.
              </p>
            </div>
          </details>
        </section>
      </main>
    </>
  );
}
