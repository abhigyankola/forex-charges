"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySelectorProps {
  currencies: { code: string; name: string }[];
  currentCode: string;
  paramName?: string;
  basePath: string;
}

export function CurrencySelector({
  currencies,
  currentCode,
  paramName = "code",
  basePath,
}: CurrencySelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, value);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={currentCode} onValueChange={handleChange}>
      <SelectTrigger className="w-[280px] rounded-md border border-border bg-card text-[13px] text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-md border border-border bg-popover shadow-lg">
        {currencies.map((c) => (
          <SelectItem key={c.code} value={c.code} className="text-[13px]">
            {c.code} — {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
