import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BankCurrencyRates, TransactionType } from "@/lib/types";

const COLUMNS: { key: TransactionType; label: string }[] = [
  { key: "tt_buy", label: "TT Buy" },
  { key: "tt_sell", label: "TT Sell" },
  { key: "card_buy", label: "Card Buy" },
  { key: "card_sell", label: "Card Sell" },
  { key: "cash_buy", label: "Cash Buy" },
  { key: "cash_sell", label: "Cash Sell" },
  { key: "bills_buy", label: "Bills Buy" },
  { key: "bills_sell", label: "Bills Sell" },
];

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
  const visibleColumns = COLUMNS.filter((col) =>
    data.some((row) => row[col.key] != null)
  );

  const bestValues: Record<string, number | null> = {};
  const worstValues: Record<string, number | null> = {};
  for (const col of visibleColumns) {
    bestValues[col.key] = findBest(data, col.key);
    worstValues[col.key] = findWorst(data, col.key);
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
              Bank
            </TableHead>
            {visibleColumns.map((col) => (
              <TableHead
                key={col.key}
                className="text-right text-[12px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
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
                        ? "bg-emerald-950/30 font-medium text-emerald-400"
                        : isWorst
                          ? "bg-red-950/20 text-red-400"
                          : "text-foreground"
                    }`}
                  >
                    {value != null ? value.toFixed(2) : "—"}
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
