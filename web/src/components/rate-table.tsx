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
import { BankCurrencyRates, TransactionType } from "@/lib/types";

const COLUMNS: { key: TransactionType; label: string; tooltip: string }[] = [
  { key: "tt_buy", label: "TT Buy", tooltip: "Telegraphic Transfer Buy — rate when you sell foreign currency via wire transfer" },
  { key: "tt_sell", label: "TT Sell", tooltip: "Telegraphic Transfer Sell — rate when you buy foreign currency via wire transfer" },
  { key: "card_buy", label: "Card Buy", tooltip: "Forex Card Buy — rate when loading foreign currency onto a prepaid card" },
  { key: "card_sell", label: "Card Sell", tooltip: "Forex Card Sell — rate when unloading/refunding forex card balance" },
  { key: "cash_buy", label: "Cash Buy", tooltip: "Cash Buy — rate when exchanging physical foreign currency notes (bank buys from you)" },
  { key: "cash_sell", label: "Cash Sell", tooltip: "Cash Sell — rate when buying physical foreign currency notes from the bank" },
  { key: "bills_buy", label: "Bills Buy", tooltip: "Bills Buy — rate for purchasing foreign currency demand drafts/cheques" },
  { key: "bills_sell", label: "Bills Sell", tooltip: "Bills Sell — rate for selling/encashing foreign currency instruments" },
];

type SortDirection = "asc" | "desc" | null;

function findBest(
  rows: BankCurrencyRates[],
  key: TransactionType
): number | null {
  const values = rows.map((r) => r[key]).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return key.endsWith("_buy") ? Math.max(...values) : Math.min(...values);
}

function findWorst(
  rows: BankCurrencyRates[],
  key: TransactionType
): number | null {
  const values = rows.map((r) => r[key]).filter((v): v is number => v != null);
  if (values.length === 0) return null;
  return key.endsWith("_buy") ? Math.min(...values) : Math.max(...values);
}

export function RateTable({ data }: { data: BankCurrencyRates[] }) {
  const [sortKey, setSortKey] = useState<TransactionType | "bank" | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const visibleColumns = COLUMNS.filter((col) =>
    data.some((row) => row[col.key] != null)
  );

  const bestValues: Record<string, number | null> = {};
  const worstValues: Record<string, number | null> = {};
  for (const col of visibleColumns) {
    bestValues[col.key] = findBest(data, col.key);
    worstValues[col.key] = findWorst(data, col.key);
  }

  function handleSort(key: TransactionType | "bank") {
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

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    if (sortKey === "bank") {
      return sortDir === "asc"
        ? a.bank_name.localeCompare(b.bank_name)
        : b.bank_name.localeCompare(a.bank_name);
    }
    const aVal = a[sortKey] ?? -Infinity;
    const bVal = b[sortKey] ?? -Infinity;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  function getSortIndicator(key: TransactionType | "bank") {
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
              onClick={() => handleSort("bank")}
            >
              Bank{getSortIndicator("bank")}
            </TableHead>
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                className="group/tip relative cursor-pointer select-none text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => handleSort(col.key)}
              >
                <span className="pointer-events-none absolute -top-9 right-0 z-50 hidden w-max max-w-[200px] rounded-md bg-foreground px-2 py-1 text-[11px] font-normal normal-case tracking-normal text-background shadow-md group-hover/tip:block">
                  {col.tooltip}
                </span>
                {col.label}{getSortIndicator(col.key)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.bank_name}>
              <TableCell className="text-[13px] font-medium text-foreground">
                {row.bank_name}
              </TableCell>
              {visibleColumns.map((col) => {
                const value = row[col.key];
                const isBest = value != null && value === bestValues[col.key];
                const isWorst =
                  value != null &&
                  value === worstValues[col.key] &&
                  bestValues[col.key] !== worstValues[col.key];
                return (
                  <TableCell
                    key={col.key}
                    className={`text-right font-mono text-[13px] ${
                      isBest
                        ? "bg-emerald-100 font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : isWorst
                          ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                          : "text-foreground"
                    }`}
                  >
                    {value != null ? `₹${value.toFixed(2)}` : "—"}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
