"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const POPULAR_CURRENCIES = ["USD", "EUR", "GBP", "AED", "SGD"];

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCurrency = currencies.find((c) => c.code === currentCode);

  const sorted = [...currencies].sort((a, b) => {
    const aPopular = POPULAR_CURRENCIES.indexOf(a.code);
    const bPopular = POPULAR_CURRENCIES.indexOf(b.code);
    if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular;
    if (aPopular !== -1) return -1;
    if (bPopular !== -1) return 1;
    return a.code.localeCompare(b.code);
  });

  const filtered = query
    ? sorted.filter(
        (c) =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase())
      )
    : sorted;

  function handleSelect(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, code);
    router.push(`${basePath}?${params.toString()}`);
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full sm:w-[280px]">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-[13px] text-foreground transition-colors hover:bg-accent"
      >
        <span>
          {currentCurrency ? `${currentCurrency.code} — ${currentCurrency.name}` : currentCode}
        </span>
        <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search currency..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-muted-foreground">No currencies found</p>
            ) : (
              filtered.map((c) => {
                const isPopular = POPULAR_CURRENCIES.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors hover:bg-accent ${
                      c.code === currentCode ? "bg-accent text-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="font-mono font-medium">{c.code}</span>
                    <span className="text-muted-foreground">{c.name}</span>
                    {isPopular && (
                      <span className="ml-auto rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Popular
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
