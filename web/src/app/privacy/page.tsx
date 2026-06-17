import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { loadRates, getLastScrapedDate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  const rates = loadRates();
  const lastUpdated = getLastScrapedDate(rates);

  return (
    <>
      <Nav lastUpdated={lastUpdated} currentPath="/privacy" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            Last updated: June 2025
          </p>
        </div>

        <div className="space-y-6 text-[14px] text-muted-foreground">
          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Overview
            </h2>
            <p>
              Forex Rates India is a free tool that compares foreign exchange
              rates from Indian banks. We are committed to protecting your
              privacy. This policy explains what data we collect and how we use
              it.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Personal Data Collection
            </h2>
            <p>
              We do not collect any personal information. There are no user
              accounts, no login systems, and no forms that ask for your name,
              email, phone number, or any other personal data. You can use this
              tool completely anonymously.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Cookies &amp; Analytics
            </h2>
            <p className="mb-2">
              We use the following third-party services that may set cookies on
              your browser:
            </p>
            <ul className="list-inside list-disc space-y-1.5 pl-2">
              <li>
                <span className="font-medium text-foreground">
                  Google Analytics
                </span>{" "}
                — to understand how visitors use the site (page views, traffic
                sources, device type). Google Analytics uses cookies to
                distinguish unique visitors. This data is aggregated and does not
                identify you personally.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Google AdSense
                </span>{" "}
                — may display ads and use cookies to serve relevant
                advertisements based on your browsing history across the web.
                You can manage your ad preferences at{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline"
                >
                  Google Ads Settings
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Data Sources
            </h2>
            <p>
              All forex rate data displayed on this website is scraped from
              publicly available sources — official bank websites and published
              PDF rate cards. We do not access any private or restricted bank
              systems. The data is refreshed daily.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Third-Party Services
            </h2>
            <p>
              This website is hosted on third-party infrastructure. These
              providers may collect standard server logs (IP address, browser
              type, access time) for operational purposes. We do not access or
              use this data to identify individual visitors.
            </p>
          </section>

          <section className="rounded-md border border-border bg-card p-5">
            <h2 className="mb-3 text-[16px] font-semibold text-foreground">
              Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Any changes
              will be reflected on this page with an updated date.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
