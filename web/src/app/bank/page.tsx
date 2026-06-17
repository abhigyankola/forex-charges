import type { Metadata } from "next";
import { Suspense } from "react";
import { Nav } from "@/components/nav";
import { BankSelector } from "@/components/bank-selector";
import {
  loadRates,
  getAllBanks,
  getRatesByBank,
  getLastScrapedDate,
} from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TransactionType,
  TRANSACTION_TYPE_LABELS,
  ALL_TRANSACTION_TYPES,
} from "@/lib/types";

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

type TabCategory = "all" | "tt" | "card" | "cash" | "bills";

const TAB_TYPES: Record<TabCategory, TransactionType[]> = {
  all: ALL_TRANSACTION_TYPES,
  tt: ["tt_buy", "tt_sell"],
  card: ["card_buy", "card_sell"],
  cash: ["cash_buy", "cash_sell"],
  bills: ["bills_buy", "bills_sell"],
};

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

        <Tabs defaultValue="all">
          <TabsList className="mb-4 h-9 rounded-lg bg-secondary p-0.5">
            {(
              [
                ["all", "All"],
                ["tt", "TT"],
                ["card", "Card"],
                ["cash", "Cash"],
                ["bills", "Bills"],
              ] as [TabCategory, string][]
            ).map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-md px-3 py-1 text-[12px] font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.entries(TAB_TYPES) as [TabCategory, TransactionType[]][]).map(
            ([tabKey, types]) => {
              const visibleTypes = types.filter((t) =>
                grouped.some((g) => g.rates[t] != null)
              );

              return (
                <TabsContent key={tabKey} value={tabKey}>
                  <div className="overflow-x-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Currency
                          </TableHead>
                          {visibleTypes.map((t) => (
                            <TableHead
                              key={t}
                              className="text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground"
                            >
                              {TRANSACTION_TYPE_LABELS[t]}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {grouped.map((g) => (
                          <TableRow key={g.currency_code}>
                            <TableCell className="text-[13px] font-medium text-foreground">
                              {g.currency_code}
                              <span className="ml-1.5 text-[12px] text-muted-foreground">
                                {g.currency_name}
                              </span>
                            </TableCell>
                            {visibleTypes.map((t) => (
                              <TableCell
                                key={t}
                                className="text-right font-mono text-[13px] text-foreground"
                              >
                                {g.rates[t] != null
                                  ? g.rates[t].toFixed(2)
                                  : "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              );
            }
          )}
        </Tabs>
      </main>
    </>
  );
}
