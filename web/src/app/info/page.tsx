import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { loadRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Forex Rate Types Explained — TT, Card, Cash, Bills",
};

const faqData = [
  {
    question: "What is TT rate in forex?",
    answer:
      "TT (Telegraphic Transfer) rate is the exchange rate applied to electronic fund transfers between banks. TT Buy is used when you receive foreign currency via wire transfer (inward remittance), and TT Sell is used when you send money abroad (outward remittance). TT rates are typically the most competitive because they involve no physical currency handling.",
  },
  {
    question: "What is the difference between TT rate and card rate?",
    answer:
      "TT rate applies to wire transfers and electronic fund movements between bank accounts, while card rate applies to transactions made using forex cards, credit cards, or debit cards internationally. Card rates are usually slightly higher than TT rates because they include additional processing costs and risk margins for card networks.",
  },
  {
    question: "Which bank has the best forex rate in India?",
    answer:
      "The best forex rate varies daily and depends on the currency and transaction type. Banks like SBI, HDFC, ICICI, HSBC, Axis, IDFC, IOB, and Kotak each offer competitive rates for different currencies. Use Forex Rates India to compare real-time rates across all 8 banks and find the best rate for your specific currency and transaction type.",
  },
  {
    question: "What is the cheapest way to send money abroad from India?",
    answer:
      "The cheapest way is usually through a bank wire transfer (TT Sell) at the bank offering the lowest TT Sell rate for your currency. Compare TT Sell rates across banks before initiating the transfer. Additionally, check if your bank charges a flat remittance fee on top of the exchange rate, as total cost includes both the rate spread and any fixed fees.",
  },
  {
    question: "What is the difference between cash rate and bills rate in forex?",
    answer:
      "Cash rate applies to physical foreign currency notes — when you buy or sell actual currency notes at a bank or money changer. Bills rate applies to paper instruments like foreign cheques, demand drafts, and export bills. Cash rates usually have a wider spread because handling physical notes involves storage, transport, and counterfeiting risks. Bills rates differ because settlement takes time and carries collection risk.",
  },
  {
    question: "How often do bank forex rates change?",
    answer:
      "Indian banks typically publish their forex rates once daily, usually in the morning. However, some banks may revise rates during the day based on market movements. The rates on Forex Rates India are updated daily from official bank sources to give you the most recent published rates.",
  },
];

export default function InfoPage() {
  const rates = loadRates();
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/info" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Understanding Forex Rates
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            What the different rate types mean and which one applies to you
          </p>
        </div>

        {/* Core Concept */}
        <section className="mb-8 rounded-md border border-border bg-card p-5">
          <h2 className="text-[16px] font-semibold text-foreground">
            The basics
          </h2>
          <div className="mt-3 space-y-2 text-[14px] text-foreground/80">
            <p>
              <span className="font-medium text-foreground">Buy</span> = the bank buys foreign currency from you (you get INR).
            </p>
            <p>
              <span className="font-medium text-foreground">Sell</span> = the bank sells foreign currency to you (you pay INR).
            </p>
          </div>
          <div className="mt-4 rounded-md bg-secondary p-4">
            <p className="text-[13px] text-muted-foreground">
              Buy rates are always lower than Sell rates. The difference (spread) is how the bank earns.
            </p>
          </div>
        </section>

        {/* Rate Types Table */}
        <section className="mb-8">
          <h2 className="mb-4 text-[16px] font-semibold text-foreground">
            Rate types explained
          </h2>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    What it means
                  </th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    When used
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">TT Buy</td>
                  <td className="px-4 py-3 text-foreground/80">Bank buys foreign currency via telegraphic transfer</td>
                  <td className="px-4 py-3 text-muted-foreground">You receive inward remittance / convert foreign currency in account to INR</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">TT Sell</td>
                  <td className="px-4 py-3 text-foreground/80">Bank sells foreign currency via telegraphic transfer</td>
                  <td className="px-4 py-3 text-muted-foreground">You send money abroad / make outward remittance</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Card Buy</td>
                  <td className="px-4 py-3 text-foreground/80">Bank buys foreign currency from you (card transaction)</td>
                  <td className="px-4 py-3 text-muted-foreground">Refunds or reversals on forex/card transactions</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Card Sell</td>
                  <td className="px-4 py-3 text-foreground/80">Bank sells foreign currency to you (card transaction)</td>
                  <td className="px-4 py-3 text-muted-foreground">International card spends, ATM withdrawals abroad</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Cash Buy</td>
                  <td className="px-4 py-3 text-foreground/80">Bank buys physical foreign currency notes from you</td>
                  <td className="px-4 py-3 text-muted-foreground">You sell leftover foreign cash notes to the bank</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Cash Sell</td>
                  <td className="px-4 py-3 text-foreground/80">Bank sells physical foreign currency notes to you</td>
                  <td className="px-4 py-3 text-muted-foreground">You buy foreign currency notes for travel</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Bills Buy</td>
                  <td className="px-4 py-3 text-foreground/80">Bank buys foreign currency bills/instruments</td>
                  <td className="px-4 py-3 text-muted-foreground">Export bills, foreign cheques, demand drafts deposited</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Bills Sell</td>
                  <td className="px-4 py-3 text-foreground/80">Bank sells foreign currency bills/instruments</td>
                  <td className="px-4 py-3 text-muted-foreground">Foreign drafts, bills, trade-related payments</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Cash vs Bills */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-border p-5">
            <h3 className="text-[14px] font-semibold text-foreground">
              Cash
            </h3>
            <p className="mt-2 text-[13px] text-foreground/80">
              Physical foreign currency notes. Used when you walk into a bank or money changer to buy/sell foreign currency.
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Usually has a wider spread because handling physical notes has costs and risks (counterfeiting, storage, transport).
            </p>
          </div>
          <div className="rounded-md border border-border p-5">
            <h3 className="text-[14px] font-semibold text-foreground">
              Bills
            </h3>
            <p className="mt-2 text-[13px] text-foreground/80">
              Foreign-currency paper instruments — cheques, demand drafts, export bills, collection instruments. Not physical notes.
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Rate differs because settlement takes time and there is collection/clearing risk.
            </p>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="mb-8">
          <h2 className="mb-4 text-[16px] font-semibold text-foreground">
            Which rate applies to me?
          </h2>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Situation
                  </th>
                  <th className="px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Look at
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Buying USD notes for a trip</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Cash Sell</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Selling leftover USD notes after trip</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Cash Buy</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Using credit/debit card abroad</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Card Sell</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Receiving salary/payment from abroad</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">TT Buy</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Sending money abroad (fees, tuition, etc.)</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">TT Sell</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Depositing a foreign cheque</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Bills Buy</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground/80">Getting a foreign currency demand draft</td>
                  <td className="px-4 py-3 font-mono font-medium text-foreground">Bills Sell</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Note about rates */}
        <section className="rounded-md border border-border bg-secondary p-5">
          <h3 className="text-[14px] font-semibold text-foreground">
            About the rates shown
          </h3>
          <ul className="mt-3 space-y-1.5 text-[13px] text-foreground/80">
            <li>All rates are quoted in INR (Indian Rupees) per 1 unit of foreign currency.</li>
            <li>Rates are indicative and subject to change throughout the day.</li>
            <li>Actual transaction rates may differ slightly due to timing, amount, and bank-specific conditions.</li>
            <li>Data is scraped daily from official bank websites and PDF publications.</li>
          </ul>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
