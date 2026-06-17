import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { loadRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  const rates = loadRates();
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/terms" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Last updated: June 2025
          </p>
        </div>

        <div className="space-y-6 text-[14px] text-muted-foreground">
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Use of This Website
            </h2>
            <p>
              Forex Rates India provides forex exchange rate data from Indian
              banks for informational purposes only. By using this website, you
              agree to the following terms.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Indicative Rates Only
            </h2>
            <p>
              All rates displayed on this website are indicative and sourced from
              publicly available bank publications. Actual transaction rates may
              vary depending on the time of transaction, amount, your
              relationship with the bank, and other factors. Always confirm the
              exact rate with your bank before making any financial decisions.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Not Financial Advice
            </h2>
            <p>
              The information on this website does not constitute financial,
              investment, or professional advice. We do not recommend any
              particular bank, currency, or transaction type. You should consult
              a qualified financial advisor before making any foreign exchange
              decisions.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              No Liability
            </h2>
            <p>
              We make no warranties or guarantees about the accuracy,
              completeness, or timeliness of the data shown. Forex Rates India
              and its operators shall not be liable for any loss, damage, or
              expense incurred as a result of decisions made based on the data
              presented on this website.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Data Collection Methods
            </h2>
            <p>
              Rate data is collected by scraping publicly available information
              from official bank websites and published rate cards. We do not
              access any private, restricted, or authenticated bank systems. If
              any bank or data owner has concerns, please contact us and we will
              address them promptly.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the website after changes constitutes acceptance of the
              updated terms.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
