export interface RawRate {
  bank_name: string;
  currency_code: string;
  currency_name: string;
  transaction_type: string;
  rate: number;
  base_currency: string;
  scraped_at: string;
}

export type TransactionType =
  | "tt_buy"
  | "tt_sell"
  | "card_buy"
  | "card_sell"
  | "cash_buy"
  | "cash_sell"
  | "bills_buy"
  | "bills_sell";

export interface NormalizedRate {
  bank_name: string;
  currency_code: string;
  currency_name: string;
  transaction_type: TransactionType;
  rate: number;
  base_currency: string;
  scraped_at: string;
}

export interface BankCurrencyRates {
  bank_name: string;
  currency_code: string;
  currency_name: string;
  tt_buy?: number;
  tt_sell?: number;
  card_buy?: number;
  card_sell?: number;
  cash_buy?: number;
  cash_sell?: number;
  bills_buy?: number;
  bills_sell?: number;
}

export interface BestRate {
  currency_code: string;
  currency_name: string;
  best_buy_bank: string;
  best_buy_rate: number;
  worst_buy_rate: number;
  best_sell_bank: string;
  best_sell_rate: number;
  worst_sell_rate: number;
}

export const MAJOR_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "AED",
  "SGD",
  "AUD",
  "CAD",
  "CHF",
] as const;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  tt_buy: "TT Buy",
  tt_sell: "TT Sell",
  card_buy: "Card Buy",
  card_sell: "Card Sell",
  cash_buy: "Cash Buy",
  cash_sell: "Cash Sell",
  bills_buy: "Bills Buy",
  bills_sell: "Bills Sell",
};

export const ALL_TRANSACTION_TYPES: TransactionType[] = [
  "tt_buy",
  "tt_sell",
  "card_buy",
  "card_sell",
  "cash_buy",
  "cash_sell",
  "bills_buy",
  "bills_sell",
];
