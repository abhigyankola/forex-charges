import { BankCurrencyRates } from "@/lib/types";

interface SpreadInfo {
  bank_name: string;
  spread: number;
  spreadPercent: number;
  buy: number;
  sell: number;
}

function computeSpreads(
  data: BankCurrencyRates[],
  buyKey: "tt_buy" | "card_buy" | "cash_buy" | "bills_buy" = "tt_buy",
  sellKey: "tt_sell" | "card_sell" | "cash_sell" | "bills_sell" = "tt_sell"
): SpreadInfo[] {
  const spreads: SpreadInfo[] = [];
  for (const row of data) {
    const buy = row[buyKey];
    const sell = row[sellKey];
    if (buy == null || sell == null) continue;
    const spread = sell - buy;
    const mid = (buy + sell) / 2;
    spreads.push({
      bank_name: row.bank_name,
      spread,
      spreadPercent: mid > 0 ? (spread / mid) * 100 : 0,
      buy,
      sell,
    });
  }
  return spreads.sort((a, b) => a.spreadPercent - b.spreadPercent);
}

export function SpreadCard({ data }: { data: BankCurrencyRates[] }) {
  const spreads = computeSpreads(data);
  if (spreads.length === 0) return null;

  const maxSpread = Math.max(...spreads.map((s) => s.spreadPercent));

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
        TT Buy–Sell Spread
      </h3>
      <div className="space-y-2.5">
        {spreads.map((s) => (
          <div key={s.bank_name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-foreground">
                {s.bank_name}
              </span>
              <span className="font-mono text-[12px] text-muted-foreground">
                {s.spreadPercent.toFixed(2)}%
                <span className="ml-2 opacity-60">
                  (₹{s.spread.toFixed(2)})
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary">
              <div
                className="h-1.5 rounded-full bg-foreground"
                style={{
                  width: `${maxSpread > 0 ? (s.spreadPercent / maxSpread) * 100 : 0}%`,
                  opacity: 0.2 + (s.spreadPercent / maxSpread) * 0.8,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Lower spread = better for consumer. Spread = Sell − Buy rate.
      </p>
    </div>
  );
}
