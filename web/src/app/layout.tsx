import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Footer } from "@/components/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Forex Rates India — Compare Bank Exchange Rates",
    template: "%s | Forex Rates India",
  },
  description:
    "Compare forex exchange rates across 8 Indian banks in real-time. Find the best TT, card, cash, and bills rates for USD, EUR, GBP, and 30+ currencies.",
  keywords: [
    "forex rates India",
    "best forex rate",
    "USD to INR",
    "compare bank forex rates",
    "forex card rates India",
    "cheapest forex rate",
    "bank exchange rate comparison",
    "TT rate today",
  ],
  openGraph: {
    title: "Forex Rates India — Compare Bank Exchange Rates",
    description:
      "Compare forex exchange rates across 8 Indian banks. Find the best buy and sell rates for USD, EUR, GBP, AED, and more.",
    type: "website",
    locale: "en_IN",
    siteName: "Forex Rates India",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forex Rates India — Compare Bank Exchange Rates",
    description:
      "Compare forex exchange rates across 8 Indian banks. Find the best rates for 30+ currencies.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://forexratesindia.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Footer />
      </body>
    </html>
  );
}
