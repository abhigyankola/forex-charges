"""Shared constants for forex scraping: transaction types, currency maps, bank URLs."""


class TransactionType:
    TT_BUY = "tt_buy"
    TT_SELL = "tt_sell"
    CARD_BUY = "card_buy"
    CARD_SELL = "card_sell"
    CASH_BUY = "cash_buy"
    CASH_SELL = "cash_sell"
    BILLS_BUY = "bills_buy"
    BILLS_SELL = "bills_sell"

    ALL = [
        TT_BUY, TT_SELL,
        CARD_BUY, CARD_SELL,
        CASH_BUY, CASH_SELL,
        BILLS_BUY, BILLS_SELL,
    ]


CURRENCY_NAMES: dict[str, str] = {
    "AED": "UAE Dirham",
    "AUD": "Australian Dollar",
    "BHD": "Bahraini Dinar",
    "CAD": "Canadian Dollar",
    "CHF": "Swiss Franc",
    "CNH": "Chinese Yuan (Offshore)",
    "DKK": "Danish Krone",
    "EUR": "Euro",
    "GBP": "British Pound",
    "HKD": "Hong Kong Dollar",
    "IDR": "Indonesian Rupiah",
    "JPY": "Japanese Yen",
    "KRW": "South Korean Won",
    "KWD": "Kuwaiti Dinar",
    "LKR": "Sri Lankan Rupee",
    "MYR": "Malaysian Ringgit",
    "NOK": "Norwegian Krone",
    "NZD": "New Zealand Dollar",
    "OMR": "Omani Rial",
    "PHP": "Philippine Peso",
    "SAR": "Saudi Riyal",
    "SEK": "Swedish Krona",
    "SGD": "Singapore Dollar",
    "THB": "Thai Baht",
    "USD": "US Dollar",
    "VND": "Vietnamese Dong",
    "ZAR": "South African Rand",
}


BANK_URLS: dict[str, str] = {
    "HSBC": "https://www.hsbc.co.in/nri/foreign-exchange-rates/",
    "ICICI": "https://www.icicibank.com/corporate/global-markets/forex/forex-card-rate",
    "AXIS": "https://application.axisbank.co.in/WebForms/corporatecardrate/index.aspx",
    "IDFC": "https://www.idfcfirstbank.com/forex-rate",
    "IOB": "https://www.iob.bank.in/en/forex-rates",
    "KOTAK": "https://www.kotak.com/en/rates/forex-rates.html",
    "SBI": "https://sbi.co.in/documents/16012/1400784/FOREX_CARD_RATES.pdf",
    "HDFC": "https://www.hdfc.bank.in/content/dam/hdfcbankpws/in/en/personal-banking/discover-products/interest-rates/hdfc-bank-treasury-forex-card-rates.pdf",
}

# Currencies commonly quoted per 100 units by Indian banks.
# Rate > threshold means it's per-100 and needs dividing.
# Threshold is set conservatively — 1 JPY ≈ 0.57 INR, 1 LKR ≈ 0.28 INR
PER_HUNDRED_THRESHOLDS: dict[str, float] = {
    "JPY": 5.0,
    "KRW": 1.0,
    "LKR": 5.0,
    "THB": 10.0,
}


SBI_ABBREVIATION_MAP: dict[str, str] = {
    "UNI": "USD",
    "UAE": "AED",
    "AUS": "AUD",
    "BAN": "BHD",
    "CAN": "CAD",
    "CHI": "CNH",
    "DAN": "DKK",
    "GRE": "GBP",
    "HON": "HKD",
    "JAP": "JPY",
    "KOR": "KRW",
    "MAL": "MYR",
    "NOR": "NOK",
    "NEW": "NZD",
    "SIN": "SGD",
    "SAU": "SAR",
    "SWE": "SEK",
    "SWI": "CHF",
    "THA": "THB",
    "SOU": "ZAR",
    "EUR": "EUR",
    "SRI": "LKR",
    "PHI": "PHP",
    "VIE": "VND",
    "IND": "IDR",
}
