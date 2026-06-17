import fs from "fs";
import path from "path";
import {
  RawRate,
  NormalizedRate,
  TransactionType,
  BankCurrencyRates,
  BestRate,
  MAJOR_CURRENCIES,
} from "./types";

function resolveDataPath(filename: string): string {
  const candidates = [
    path.join(process.cwd(), "..", "data", filename),
    path.join(process.cwd(), "data", filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[1];
}

const TYPE_NORMALIZATION: Record<string, TransactionType> = {
  card_rate_buy: "card_buy",
  card_rate_sell: "card_sell",
  currency_buy: "cash_buy",
  currency_sell: "cash_sell",
  buy: "card_buy",
  sell: "card_sell",
};

// Currencies commonly quoted per 100 units by some banks.
// If rate exceeds threshold, it's per-100 and needs dividing.
const PER_HUNDRED_THRESHOLDS: Record<string, number> = {
  JPY: 5,
  KRW: 1,
  LKR: 5,
  THB: 10,
};

// SBI uses non-standard abbreviations for some currencies
const CURRENCY_CODE_ALIASES: Record<string, string> = {
  BAH: "BHD",
  KUW: "KWD",
  OMA: "OMR",
  QAT: "QAR",
  TUR: "TRY",
  KEN: "KES",
  PAK: "PKR",
};

const CURRENCY_NAME_MAP: Record<string, string> = {
  BHD: "Bahraini Dinar",
  KWD: "Kuwaiti Dinar",
  OMR: "Omani Rial",
  QAR: "Qatari Riyal",
  TRY: "Turkish Lira",
  KES: "Kenyan Shilling",
  PKR: "Pakistani Rupee",
  RUB: "Russian Ruble",
  AED: "UAE Dirham",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNH: "Chinese Yuan",
  DKK: "Danish Krone",
  EUR: "Euro",
  GBP: "British Pound",
  HKD: "Hong Kong Dollar",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  LKR: "Sri Lankan Rupee",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PLN: "Polish Zloty",
  SAR: "Saudi Riyal",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  USD: "US Dollar",
  ZAR: "South African Rand",
};

// Clean up currency names that contain unit indicators like "/ 100" or "()"
function cleanCurrencyName(code: string, name: string): string {
  let cleaned = name
    .replace(/\s*\/\s*\d+/, "")
    .replace(/\s*\(\s*\)/, "")
    .trim();
  if (!cleaned) {
    const fallback: Record<string, string> = {
      JPY: "Japanese Yen",
      KRW: "South Korean Won",
      LKR: "Sri Lankan Rupee",
    };
    return fallback[code] ?? code;
  }
  return cleaned;
}

function normalizeType(type: string): TransactionType | null {
  if (TYPE_NORMALIZATION[type]) return TYPE_NORMALIZATION[type];
  const validTypes: TransactionType[] = [
    "tt_buy",
    "tt_sell",
    "card_buy",
    "card_sell",
    "cash_buy",
    "cash_sell",
    "bills_buy",
    "bills_sell",
  ];
  if (validTypes.includes(type as TransactionType))
    return type as TransactionType;
  return null;
}

export function loadRates(): NormalizedRate[] {
  const filePath = resolveDataPath("all_banks_rates.json");
  const raw: RawRate[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  const normalized: NormalizedRate[] = [];
  for (const r of raw) {
    const txType = normalizeType(r.transaction_type);
    if (!txType) continue;

    let rate = r.rate;
    if (rate <= 0) continue;

    let code = r.currency_code.toUpperCase().trim();
    code = CURRENCY_CODE_ALIASES[code] ?? code;

    const threshold = PER_HUNDRED_THRESHOLDS[code];
    if (threshold !== undefined && rate > threshold) {
      rate = rate / 100;
    }

    const currencyName = CURRENCY_NAME_MAP[code] ?? cleanCurrencyName(code, r.currency_name);
    normalized.push({ ...r, rate, currency_code: code, currency_name: currencyName, transaction_type: txType });
  }

  // Deduplicate: keep the entry with the latest scraped_at for each unique combo
  const seen = new Map<string, NormalizedRate>();
  for (const r of normalized) {
    const key = `${r.bank_name}|${r.currency_code}|${r.transaction_type}`;
    const existing = seen.get(key);
    if (!existing || r.scraped_at > existing.scraped_at) {
      seen.set(key, r);
    }
  }

  return Array.from(seen.values());
}

export function getRatesByCurrency(
  rates: NormalizedRate[],
  currencyCode: string
): BankCurrencyRates[] {
  const filtered = rates.filter((r) => r.currency_code === currencyCode);
  const bankMap = new Map<string, BankCurrencyRates>();

  for (const r of filtered) {
    if (!bankMap.has(r.bank_name)) {
      bankMap.set(r.bank_name, {
        bank_name: r.bank_name,
        currency_code: r.currency_code,
        currency_name: r.currency_name,
      });
    }
    const entry = bankMap.get(r.bank_name)!;
    entry[r.transaction_type] = r.rate;
  }

  return Array.from(bankMap.values()).sort((a, b) =>
    a.bank_name.localeCompare(b.bank_name)
  );
}

export function getRatesByBank(
  rates: NormalizedRate[],
  bankName: string
): NormalizedRate[] {
  return rates
    .filter((r) => r.bank_name === bankName)
    .sort((a, b) => a.currency_code.localeCompare(b.currency_code));
}

export function getBestRates(rates: NormalizedRate[]): BestRate[] {
  const results: BestRate[] = [];

  for (const currency of MAJOR_CURRENCIES) {
    const currencyRates = rates.filter(
      (r) => r.currency_code === currency
    );
    if (currencyRates.length === 0) continue;

    // For buy rates (bank buys forex from you → you get INR), higher is better
    const buyRates = currencyRates.filter((r) =>
      r.transaction_type.endsWith("_buy")
    );
    // For sell rates (bank sells forex to you → you pay INR), lower is better
    const sellRates = currencyRates.filter((r) =>
      r.transaction_type.endsWith("_sell")
    );

    // Use TT rates as default comparison, fall back to any buy/sell
    const ttBuys = buyRates.filter((r) => r.transaction_type === "tt_buy");
    const ttSells = sellRates.filter((r) => r.transaction_type === "tt_sell");

    const compareBuys = ttBuys.length > 0 ? ttBuys : buyRates;
    const compareSells = ttSells.length > 0 ? ttSells : sellRates;

    if (compareBuys.length === 0 && compareSells.length === 0) continue;

    const bestBuy = compareBuys.length > 0
      ? compareBuys.reduce((best, r) => (r.rate > best.rate ? r : best))
      : null;
    const worstBuy = compareBuys.length > 0
      ? compareBuys.reduce((worst, r) => (r.rate < worst.rate ? r : worst))
      : null;
    const bestSell = compareSells.length > 0
      ? compareSells.reduce((best, r) => (r.rate < best.rate ? r : best))
      : null;
    const worstSell = compareSells.length > 0
      ? compareSells.reduce((worst, r) => (r.rate > worst.rate ? r : worst))
      : null;

    const currencyName =
      currencyRates[0]?.currency_name ?? currency;

    results.push({
      currency_code: currency,
      currency_name: currencyName,
      best_buy_bank: bestBuy?.bank_name ?? "—",
      best_buy_rate: bestBuy?.rate ?? 0,
      worst_buy_rate: worstBuy?.rate ?? 0,
      best_sell_bank: bestSell?.bank_name ?? "—",
      best_sell_rate: bestSell?.rate ?? 0,
      worst_sell_rate: worstSell?.rate ?? 0,
    });
  }

  return results;
}

export function getAllBanks(rates: NormalizedRate[]): string[] {
  return [...new Set(rates.map((r) => r.bank_name))].sort();
}

export function getAllCurrencies(
  rates: NormalizedRate[]
): { code: string; name: string }[] {
  const map = new Map<string, string>();
  for (const r of rates) {
    if (!map.has(r.currency_code)) {
      map.set(r.currency_code, r.currency_name);
    }
  }
  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function getLastScrapedDate(rates: NormalizedRate[]): string {
  if (rates.length === 0) return "Unknown";
  const latest = rates.reduce((max, r) =>
    r.scraped_at > max.scraped_at ? r : max
  );
  const date = new Date(latest.scraped_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getBankStats(rates: NormalizedRate[]) {
  const banks = getAllBanks(rates);
  return banks.map((bank) => {
    const bankRates = rates.filter((r) => r.bank_name === bank);
    const currencies = new Set(bankRates.map((r) => r.currency_code));
    return {
      bank_name: bank,
      rate_count: bankRates.length,
      currency_count: currencies.size,
    };
  });
}
