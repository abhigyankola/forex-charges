"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BankSelectorProps {
  banks: string[];
  currentBank: string;
  basePath: string;
}

export function BankSelector({
  banks,
  currentBank,
  basePath,
}: BankSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string | null) {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("name", value);
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <Select value={currentBank} onValueChange={handleChange}>
      <SelectTrigger className="w-[240px] rounded-md border border-border bg-card text-[13px] text-foreground">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-md border border-border bg-popover shadow-lg">
        {banks.map((bank) => (
          <SelectItem key={bank} value={bank} className="text-[13px]">
            {bank}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
