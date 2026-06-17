import os
import re
from typing import List, Optional

import pdfplumber
import requests

from scraper.constants import (
    BANK_URLS,
    CURRENCY_NAMES,
    SBI_ABBREVIATION_MAP,
    TransactionType,
)
from scraper.models import ForexRate, ForexData


class SBIScraper:
    """PDF-based scraper for SBI forex rates."""

    def __init__(self):
        self.bank_name = "SBI"
        self.pdf_url = BANK_URLS["SBI"]
        self.forex_data = ForexData()

    def scrape(self) -> ForexData:
        return self.extract()

    def extract(self) -> ForexData:
        pdf_path = self._download_pdf()

        if not pdf_path:
            print("Failed to download SBI PDF")
            return self.forex_data

        try:
            rates = self._extract_rates_from_pdf(pdf_path)
            if rates:
                self.forex_data.add_rates(rates)
                print(f"SBI: Successfully extracted {len(rates)} rates from PDF")
            else:
                print("SBI: No rates found in PDF")
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

    @staticmethod
    def _download_pdf() -> Optional[str]:
        try:
            print("Downloading SBI PDF...")
            response = requests.get(BANK_URLS["SBI"], timeout=30)
            response.raise_for_status()

            pdf_path = "temp_sbi_forex.pdf"
            with open(pdf_path, "wb") as f:
                f.write(response.content)

            print("PDF downloaded successfully")
            return pdf_path
        except Exception as e:
            print(f"Error downloading PDF: {e}")
            return None

    def _extract_rates_from_pdf(self, pdf_path: str) -> List[ForexRate]:
        rates = []

        try:
            with pdfplumber.open(pdf_path) as pdf:
                print(f"PDF has {len(pdf.pages)} pages")

                for page_num, page in enumerate(pdf.pages):
                    print(f"\nProcessing page {page_num + 1}...")
                    text = page.extract_text()
                    if not text:
                        continue

                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            rates.extend(self._parse_table(table))

                    if not rates:
                        rates.extend(self._parse_text(text))

        except Exception as e:
            print(f"Error extracting from PDF: {e}")

        return rates

    def _parse_table(self, table: List[List[str]]) -> List[ForexRate]:
        rates = []

        if not table or len(table) < 2:
            return rates

        header_row_idx = None
        headers = []

        for i, row in enumerate(table):
            if row and any(
                cell and "currency" in str(cell).lower() for cell in row
            ):
                header_row_idx = i
                headers = [str(cell).strip() if cell else "" for cell in row]
                break

        if header_row_idx is None:
            for i, row in enumerate(table):
                if row and any(
                    cell and re.search(r"(buy|sell|rate)", str(cell), re.I)
                    for cell in row
                ):
                    header_row_idx = max(0, i - 1)
                    if header_row_idx < len(table):
                        headers = [
                            str(cell).strip() if cell else ""
                            for cell in table[header_row_idx]
                        ]
                    break

        if header_row_idx is None:
            return rates

        for row_idx in range(header_row_idx + 1, len(table)):
            row = table[row_idx]
            if not row or len(row) < 2:
                continue

            currency_cell = str(row[0]).strip() if row[0] else ""
            currency_match = re.search(r"([A-Z]{3})", currency_cell)

            if not currency_match:
                continue

            abbrev = currency_match.group(1)
            currency_code = SBI_ABBREVIATION_MAP.get(abbrev, abbrev)
            currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

            for col_idx in range(1, len(row)):
                if col_idx >= len(row) or not row[col_idx]:
                    continue
                try:
                    rate_value = float(str(row[col_idx]).strip())
                    if col_idx < len(headers):
                        transaction_type = self._map_transaction_type(headers[col_idx])
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
        rates = []
        lines = text.split("\n")
        currency_pattern = re.compile(r"([A-Z]{3})")

        for line in lines:
            if any(
                skip in line.lower()
                for skip in ["forex", "card", "rate", "page", "date"]
            ):
                continue

            numbers = re.findall(r"\d+\.\d+", line)
            currency_match = currency_pattern.search(line)

            if currency_match and numbers:
                abbrev = currency_match.group(1)
                currency_code = SBI_ABBREVIATION_MAP.get(abbrev, abbrev)
                currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

                for i, rate_str in enumerate(numbers[:2]):
                    try:
                        rate_value = float(rate_str)
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
        header_lower = header.lower().replace("\n", " ")

        is_buy = "buy" in header_lower
        is_sell = "sell" in header_lower

        if is_buy:
            if "cn" in header_lower or "cash" in header_lower or "currency note" in header_lower:
                return TransactionType.CASH_BUY
            elif "card" in header_lower or "forex" in header_lower:
                return TransactionType.CARD_BUY
            elif "tt" in header_lower or "t.t" in header_lower:
                return TransactionType.TT_BUY
            elif "bill" in header_lower:
                return TransactionType.BILLS_BUY
            return TransactionType.TT_BUY
        elif is_sell:
            if "cn" in header_lower or "cash" in header_lower or "currency note" in header_lower:
                return TransactionType.CASH_SELL
            elif "card" in header_lower or "forex" in header_lower:
                return TransactionType.CARD_SELL
            elif "tt" in header_lower or "t.t" in header_lower:
                return TransactionType.TT_SELL
            elif "bill" in header_lower:
                return TransactionType.BILLS_SELL
            return TransactionType.TT_SELL

        return None
