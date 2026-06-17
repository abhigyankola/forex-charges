import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { loadRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  const rates = loadRates();
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/contact" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Contact
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Get in touch with us
          </p>
        </div>

        <section className="rounded-md border border-border bg-card p-5">
          <h2 className="mb-3 text-[16px] font-semibold text-foreground">
            Reach Out
          </h2>
          <p className="text-[14px] text-muted-foreground">
            Have a question, feedback, or found an issue with the data? We'd
            love to hear from you.
          </p>
          <div className="mt-4 rounded-md bg-secondary p-4">
            <p className="text-[13px] text-muted-foreground">
              Email us at{" "}
              <a
                href="mailto:hello@forexratesindia.com"
                className="font-medium text-foreground underline"
              >
                hello@forexratesindia.com
              </a>
            </p>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">
            We typically respond within a few business days. If you&apos;re a
            bank or data provider with concerns about your data being displayed,
            please reach out and we will address it promptly.
          </p>
        </section>
      </main>
    </>
  );
}
