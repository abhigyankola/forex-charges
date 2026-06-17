import os
import re
from typing import List, Optional

import pdfplumber
import requests

from scraper.constants import BANK_URLS, CURRENCY_NAMES, TransactionType
from scraper.models import ForexRate, ForexData


class HDFCScraper:
    """PDF-based scraper for HDFC Bank forex card rates.

    Source: HDFC treasury forex card rates PDF.
    """

    def __init__(self):
        self.bank_name = "HDFC"
        self.pdf_url = BANK_URLS["HDFC"]
        self.forex_data = ForexData()

    def scrape(self) -> ForexData:
        pdf_path = self._download_pdf()

        if not pdf_path:
            print("Failed to download HDFC PDF")
            return self.forex_data

        try:
            rates = self._extract_rates_from_pdf(pdf_path)
            if rates:
                self.forex_data.add_rates(rates)
                print(f"HDFC: Successfully extracted {len(rates)} rates from PDF")
            else:
                print("HDFC: No rates found in PDF")
        finally:
            if os.path.exists(pdf_path):
                os.remove(pdf_path)

        return self.forex_data

    def run(self) -> ForexData:
        print(f"Starting scraper for {self.bank_name}...")
        try:
            forex_data = self.scrape()
            print(f"Successfully scraped {len(forex_data.rates)} rates from {self.bank_name}")
            return forex_data
        except Exception as e:
            print(f"Error running scraper for {self.bank_name}: {e}")
            return ForexData()

    def _download_pdf(self) -> Optional[str]:
        try:
            print("Downloading HDFC PDF...")
            response = requests.get(self.pdf_url, timeout=30, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            })
            response.raise_for_status()

            pdf_path = "temp_hdfc_forex.pdf"
            with open(pdf_path, "wb") as f:
                f.write(response.content)

            print("HDFC PDF downloaded successfully")
            return pdf_path
        except Exception as e:
            print(f"Error downloading HDFC PDF: {e}")
            return None

    def _extract_rates_from_pdf(self, pdf_path: str) -> List[ForexRate]:
        rates = []

        try:
            with pdfplumber.open(pdf_path) as pdf:
                print(f"HDFC PDF has {len(pdf.pages)} pages")

                for page_num, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            rates.extend(self._parse_table(table))

                    if not rates:
                        text = page.extract_text()
                        if text:
                            rates.extend(self._parse_text(text))

        except Exception as e:
            print(f"Error extracting from HDFC PDF: {e}")

        return rates

    def _parse_table(self, table: List[List[str]]) -> List[ForexRate]:
        rates = []

        if not table or len(table) < 2:
            return rates

        header_row_idx = None
        headers = []

        for i, row in enumerate(table):
            if not row:
                continue
            row_text = " ".join(str(cell).lower() for cell in row if cell)
            if "currency" in row_text or ("buy" in row_text and "sell" in row_text):
                header_row_idx = i
                headers = [str(cell).strip() if cell else "" for cell in row]
                break

        if header_row_idx is None:
            return rates

        for row_idx in range(header_row_idx + 1, len(table)):
            row = table[row_idx]
            if not row or len(row) < 3:
                continue

            # HDFC PDF: column 0 = currency name, column 1 = currency code
            code_cell = str(row[1]).strip() if row[1] else ""
            name_cell = str(row[0]).strip() if row[0] else ""

            currency_code = None
            code_match = re.match(r"^[A-Z]{3}$", code_cell)
            if code_match:
                currency_code = code_cell
            else:
                currency_match = re.search(r"([A-Z]{3})", name_cell)
                if currency_match:
                    currency_code = currency_match.group(1)
                else:
                    currency_code = self._guess_currency_code(name_cell)

            if not currency_code or currency_code == "INR":
                continue

            currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

            # Rates start from column 2 onward
            for col_idx in range(2, len(row)):
                if col_idx >= len(row) or not row[col_idx]:
                    continue
                cell_text = str(row[col_idx]).replace(",", "").strip()
                if cell_text == "-" or cell_text == "":
                    continue
                try:
                    rate_value = float(cell_text)
                    if rate_value <= 0:
                        continue

                    if col_idx < len(headers):
                        transaction_type = self._map_transaction_type(headers[col_idx])
                    else:
                        transaction_type = None

                    if transaction_type:
                        rates.append(ForexRate(
                            bank_name=self.bank_name,
                            currency_code=currency_code,
                            currency_name=currency_name,
                            transaction_type=transaction_type,
                            rate=rate_value,
                        ))
                except ValueError:
                    continue

        return rates

    def _parse_text(self, text: str) -> List[ForexRate]:
        """Fallback: parse rates from raw text lines."""
        rates = []
        lines = text.split("\n")

        for line in lines:
            if any(skip in line.lower() for skip in ["header", "page", "date", "note"]):
                continue

            numbers = re.findall(r"\d+\.\d+", line)
            currency_match = re.search(r"([A-Z]{3})", line)

            if currency_match and numbers:
                currency_code = currency_match.group(1)
                if currency_code == "INR":
                    continue

                currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

                for i, rate_str in enumerate(numbers[:2]):
                    try:
                        rate_value = float(rate_str)
                        if rate_value <= 0:
                            continue
                        transaction_type = (
                            TransactionType.CARD_BUY if i == 0
                            else TransactionType.CARD_SELL
                        )
                        rates.append(ForexRate(
                            bank_name=self.bank_name,
                            currency_code=currency_code,
                            currency_name=currency_name,
                            transaction_type=transaction_type,
                            rate=rate_value,
                        ))
                    except ValueError:
                        continue

        return rates

    @staticmethod
    def _map_transaction_type(header: str) -> Optional[str]:
        header_lower = header.lower().replace("\n", " ").replace("/", "")

        is_buy = "buy" in header_lower or "purchase" in header_lower or "cash out" in header_lower or "cashout" in header_lower
        is_sell = "sell" in header_lower or "sale" in header_lower or "load" in header_lower or "issuance" in header_lower

        if is_buy:
            if "cash" in header_lower and "card" not in header_lower and "forex" not in header_lower:
                return TransactionType.CASH_BUY
            elif "card" in header_lower or "forex" in header_lower or "tc" in header_lower:
                return TransactionType.CARD_BUY
            elif "tt" in header_lower or "t.t" in header_lower or "transfer" in header_lower:
                return TransactionType.TT_BUY
            elif "bill" in header_lower:
                return TransactionType.BILLS_BUY
            return TransactionType.TT_BUY
        elif is_sell:
            if "cash" in header_lower and "card" not in header_lower and "forex" not in header_lower:
                return TransactionType.CASH_SELL
            elif "card" in header_lower or "forex" in header_lower or "tc" in header_lower or "load" in header_lower:
                return TransactionType.CARD_SELL
            elif "tt" in header_lower or "t.t" in header_lower or "transfer" in header_lower:
                return TransactionType.TT_SELL
            elif "bill" in header_lower:
                return TransactionType.BILLS_SELL
            elif "dd" in header_lower or "issuance" in header_lower:
                return TransactionType.BILLS_SELL
            return TransactionType.TT_SELL

        return None

    @staticmethod
    def _guess_currency_code(text: str) -> Optional[str]:
        text_lower = text.lower().strip()
        mapping = {
            "us dollar": "USD",
            "dollar": "USD",
            "euro": "EUR",
            "pound": "GBP",
            "yen": "JPY",
            "swiss franc": "CHF",
            "canadian": "CAD",
            "australian": "AUD",
            "singapore": "SGD",
            "hong kong": "HKD",
            "dirham": "AED",
            "riyal": "SAR",
            "dinar": "BHD",
        }
        for key, code in mapping.items():
            if key in text_lower:
                return code
        return None
