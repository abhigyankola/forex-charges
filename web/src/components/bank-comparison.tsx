import { BankCurrencyRates } from "@/lib/types";
import { RateTable } from "./rate-table";
import { SpreadCard } from "./spread-card";

export function BankComparison({
  data,
  currencyCode,
  currencyName,
}: {
  data: BankCurrencyRates[];
  currencyCode: string;
  currencyName: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-foreground">
          {currencyCode}
          <span className="ml-2 text-[14px] font-normal text-muted-foreground">
            {currencyName}
          </span>
        </h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Comparing rates across {data.length} bank{data.length !== 1 ? "s" : ""}
        </p>
      </div>
      <RateTable data={data} />
      <SpreadCard data={data} />
    </div>
  );
}
