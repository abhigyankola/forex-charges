"use client";

import { useState } from "react";
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

type GroupedCurrency = {
  currency_code: string;
  currency_name: string;
  rates: Record<string, number>;
};

type TabCategory = "all" | "tt" | "card" | "cash" | "bills";

const TAB_TYPES: Record<TabCategory, TransactionType[]> = {
  all: ALL_TRANSACTION_TYPES,
  tt: ["tt_buy", "tt_sell"],
  card: ["card_buy", "card_sell"],
  cash: ["cash_buy", "cash_sell"],
  bills: ["bills_buy", "bills_sell"],
};

type SortDirection = "asc" | "desc" | null;

const COLUMN_TOOLTIPS: Record<string, string> = {
  tt_buy: "Telegraphic Transfer Buy — rate when you sell foreign currency via wire transfer",
  tt_sell: "Telegraphic Transfer Sell — rate when you buy foreign currency via wire transfer",
  card_buy: "Forex Card Buy — rate when loading foreign currency onto a prepaid card",
  card_sell: "Forex Card Sell — rate when unloading/refunding forex card balance",
  cash_buy: "Cash Buy — rate when exchanging physical foreign currency notes (bank buys from you)",
  cash_sell: "Cash Sell — rate when buying physical foreign currency notes from the bank",
  bills_buy: "Bills Buy — rate for purchasing foreign currency demand drafts/cheques",
  bills_sell: "Bills Sell — rate for selling/encashing foreign currency instruments",
};

export function BankRateTable({ grouped }: { grouped: GroupedCurrency[] }) {
  return (
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
              <SortableTabTable grouped={grouped} visibleTypes={visibleTypes} />
            </TabsContent>
          );
        }
      )}
    </Tabs>
  );
}

function SortableTabTable({
  grouped,
  visibleTypes,
}: {
  grouped: GroupedCurrency[];
  visibleTypes: TransactionType[];
}) {
  const [sortKey, setSortKey] = useState<TransactionType | "currency" | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  function handleSort(key: TransactionType | "currency") {
    if (sortKey === key) {
      if (sortDir === "desc") setSortDir("asc");
      else if (sortDir === "asc") {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortedData = [...grouped].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    if (sortKey === "currency") {
      return sortDir === "asc"
        ? a.currency_code.localeCompare(b.currency_code)
        : b.currency_code.localeCompare(a.currency_code);
    }
    const aVal = a.rates[sortKey] ?? -Infinity;
    const bVal = b.rates[sortKey] ?? -Infinity;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function getSortIndicator(key: TransactionType | "currency") {
    if (sortKey !== key) return <span className="ml-1 text-muted-foreground/40">↕</span>;
    return <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead
              className="cursor-pointer select-none text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => handleSort("currency")}
            >
              Currency{getSortIndicator("currency")}
            </TableHead>
            {visibleTypes.map((t) => (
              <TableHead
                key={t}
                className="group/tip relative cursor-pointer select-none text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleSort(t)}
              >
                <span className="pointer-events-none absolute -top-9 right-0 z-50 hidden w-max max-w-[200px] rounded-md bg-foreground px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-background shadow-md group-hover/tip:block">
                  {COLUMN_TOOLTIPS[t]}
                </span>
                {TRANSACTION_TYPE_LABELS[t]}{getSortIndicator(t)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((g) => (
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
                  {g.rates[t] != null ? `₹${g.rates[t].toFixed(2)}` : "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
