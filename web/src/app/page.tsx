import Link from "next/link";
import { Nav } from "@/components/nav";
import {
  loadRates,
  getAllBanks,
  getAllCurrencies,
  getLastScrapedDate,
  getBankStats,
  getBestRates,
} from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const rates = loadRates();
  const banks = getAllBanks(rates);
  const currencies = getAllCurrencies(rates);
  const lastUpdated = getLastScrapedDate(rates);
  const bankStats = getBankStats(rates);
  const bestRates = getBestRates(rates);

  const topCurrencies = bestRates.filter((r) =>
    ["USD", "EUR", "GBP"].includes(r.currency_code)
  );

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/" />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Overview
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Forex rates from Indian banks, updated {lastUpdated}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Banks", value: banks.length },
            { label: "Currencies", value: currencies.length },
            { label: "Total Rates", value: rates.length },
            { label: "Last Updated", value: lastUpdated.split(",")[0] },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-md border border-border bg-card p-4"
            >
              <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 font-mono text-[20px] font-semibold tracking-[-0.03em] text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold tracking-[-0.03em] text-foreground">
              Quick Comparison
            </h2>
            <Link
              href="/best-rates"
              className="text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Currency
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Best Buy
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Bank
                  </TableHead>
                  <TableHead className="text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Best Sell
                  </TableHead>
                  <TableHead className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Bank
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCurrencies.map((r) => (
                  <TableRow key={r.currency_code}>
                    <TableCell>
                      <Link
                        href={`/currency?code=${r.currency_code}`}
                        className="text-[13px] font-medium text-foreground hover:underline"
                      >
                        {r.currency_code}
                        <span className="ml-1.5 text-muted-foreground">
                          {r.currency_name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px] font-medium text-emerald-400">
                      {r.best_buy_rate > 0 ? r.best_buy_rate.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {r.best_buy_bank}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px] font-medium text-emerald-400">
                      {r.best_sell_rate > 0 ? r.best_sell_rate.toFixed(2) : "—"}
                    </TableCell>
                    <TableCell className="text-[12px] text-muted-foreground">
                      {r.best_sell_bank}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div>
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
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-foreground">
            Compare Forex Exchange Rates Across Indian Banks
          </h2>
          <div className="mt-4 space-y-4 text-[14px] leading-relaxed text-muted-foreground">
            <p>
              Finding the best foreign exchange rate can save you a significant amount of money,
              whether you&apos;re sending a remittance abroad, buying forex for travel, or loading
              a forex card. Indian banks each publish their own exchange rates daily, but comparing
              them manually across multiple bank websites is time-consuming and tedious. Forex Rates
              India solves this by aggregating rates from 8 major Indian banks into a single,
              easy-to-use comparison dashboard.
            </p>

            <h3 className="text-[16px] font-semibold text-foreground">
              Banks We Cover
            </h3>
            <p>
              We track forex rates from HSBC, ICICI Bank, Axis Bank, IDFC First Bank, Indian
              Overseas Bank (IOB), Kotak Mahindra Bank, State Bank of India (SBI), and HDFC Bank.
              These banks collectively serve hundreds of millions of customers and are the most
              commonly used for international remittances, forex cards, and currency exchange in
              India. Rates are scraped daily from their official websites and published rate cards,
              ensuring you always see the most recent data available.
            </p>

            <h3 className="text-[16px] font-semibold text-foreground">
              Understanding Forex Rate Types
            </h3>
            <p>
              Banks publish several types of exchange rates, each applicable to different
              transactions. <strong className="text-foreground">TT (Telegraphic Transfer)</strong>{" "}
              rates apply to electronic wire transfers — this is the rate you&apos;ll get when
              sending money abroad or receiving an inward remittance. TT rates are generally the
              most competitive since no physical currency is involved.{" "}
              <strong className="text-foreground">Card rates</strong> apply to forex card
              transactions, credit card, and debit card usage abroad. These tend to be slightly
              higher than TT rates due to additional processing costs.
            </p>
            <p>
              <strong className="text-foreground">Cash rates</strong> are for buying or selling
              physical foreign currency notes at a bank branch or money changer. Cash rates
              typically have the widest spread because handling physical notes involves storage,
              transport, and counterfeiting risks.{" "}
              <strong className="text-foreground">Bills rates</strong> apply to foreign-currency
              instruments like cheques, demand drafts, and export bills. These rates factor in the
              collection time and clearing risk associated with paper instruments.
            </p>

            <h3 className="text-[16px] font-semibold text-foreground">
              How to Use This Tool
            </h3>
            <p>
              Start with the <strong className="text-foreground">Overview</strong> page to see a
              quick snapshot of the best rates across banks for popular currencies like USD, EUR,
              and GBP. Use the <strong className="text-foreground">By Currency</strong> view to
              compare rates for a specific currency across all banks — perfect when you know which
              currency you need. The{" "}
              <strong className="text-foreground">By Bank</strong> view shows all rates offered by
              a single bank, useful if you already bank with a particular institution and want to
              see their complete forex offering.
            </p>
            <p>
              The <strong className="text-foreground">Best Rates</strong> page highlights the
              best buy and sell rates available for each currency, along with how much you could
              save compared to the worst rate. Before making any forex transaction — whether
              it&apos;s sending tuition fees abroad, buying travel currency, or loading a forex
              card — check the best rates here to ensure you&apos;re getting a competitive deal.
            </p>

            <h3 className="text-[16px] font-semibold text-foreground">
              Updated Daily
            </h3>
            <p>
              All rates on this website are updated daily from official bank sources. While rates
              are indicative and the actual rate at the time of your transaction may vary slightly,
              this tool gives you a reliable baseline for comparison. We recommend checking the
              rates here before visiting your bank so you can negotiate better or choose the bank
              offering the most favorable exchange rate for your needs.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
