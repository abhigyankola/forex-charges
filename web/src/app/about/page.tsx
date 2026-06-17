import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { loadRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
};

const banks = [
  "HSBC",
  "ICICI",
  "AXIS",
  "IDFC",
  "IOB",
  "KOTAK",
  "SBI",
  "HDFC",
];

export default function AboutPage() {
  const rates = loadRates();
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/about" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            About Forex Rates India
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            A free tool to compare forex exchange rates across Indian banks
          </p>
        </div>

        <div className="space-y-6 text-[14px] text-muted-foreground">
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              What We Do
            </h2>
            <p>
              Forex Rates India compares foreign exchange rates from major Indian
              banks in one place. Instead of visiting each bank&apos;s website
              individually, you can view and compare TT, card, cash, and bills
              rates for 30+ currencies — all on a single dashboard.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Banks Covered
            </h2>
            <p className="mb-3">
              We currently track forex rates from 8 Indian banks:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {banks.map((bank) => (
                <div
                  key={bank}
                  className="rounded-md bg-secondary px-3 py-2 text-center text-[13px] font-medium text-foreground"
                >
                  {bank}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              How It Works
            </h2>
            <p>
              Rate data is collected daily from official bank websites and
              published PDF rate cards. The data is processed and presented in an
              easy-to-compare format. You can view rates by currency, by bank, or
              find the best available rates across all banks.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Who Is This For?
            </h2>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                People sending or receiving international remittances who want
                the best TT rates
              </li>
              <li>
                Travelers looking for the best forex card or cash exchange rates
              </li>
              <li>
                Students and professionals paying tuition fees or expenses abroad
              </li>
              <li>
                Anyone who deals with foreign currency and wants to compare
                rates before choosing a bank
              </li>
            </ul>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Daily Updates
            </h2>
            <p>
              Rates are refreshed daily so you always see the latest available
              data. The last update was on{" "}
              <span className="font-medium text-foreground">{lastUpdated}</span>
              .
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
