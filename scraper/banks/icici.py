import json
import re
from typing import List

from bs4 import BeautifulSoup

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, TransactionType
from scraper.models import ForexRate, ForexData


class ICICIScraper(BaseScraper):
    """Scraper for ICICI Bank forex rates."""

    def __init__(self):
        super().__init__("ICICI", BANK_URLS["ICICI"])

    def scrape(self) -> ForexData:
        html_content = self.get_page_content(use_selenium=True)

        if not html_content:
            print("Failed to get ICICI page content")
            return self.forex_data

        soup = self.parse_soup(html_content)
        rates = self.parse_rates(soup)
        self.forex_data.add_rates(rates)
        return self.forex_data

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        rates = []

        tables = soup.find_all("table")

        for table in tables:
            rows = table.find_all("tr")
            if len(rows) < 3:
                continue

            # Try to find header row to determine column mapping
            header_row = None
            for row in rows[:5]:
                text = row.get_text(strip=True).lower()
                if "buy" in text and "sell" in text:
                    header_row = row
                    break

            for row in rows:
                cells = row.find_all("td")
                if len(cells) < 3:
                    continue

                # First cell should contain currency name + code
                currency_text = cells[0].get_text(strip=True)
                currency_match = re.search(r"\(([A-Z]{3})\)", currency_text)
                if not currency_match:
                    currency_match = re.search(r"([A-Z]{3})", currency_text)
                if not currency_match:
                    continue

                currency_code = currency_match.group(1)
                if currency_code in ("INR", "BAN", "RAT", "CUR", "FOR"):
                    continue

                currency_name = re.sub(r"\s*\([A-Z]{3}\)\s*", "", currency_text).strip()
                if not currency_name:
                    currency_name = currency_code

                # ICICI table: 10 rate columns
                # Buy side: TT Buy, Bills Buy, Cash Buy, Card Buy, DD Buy
                # Sell side: TT Sell, Bills Sell, Cash Sell, Card Sell, DD Sell
                col_mapping_10 = [
                    (1, TransactionType.TT_BUY),
                    (2, TransactionType.BILLS_BUY),
                    (3, TransactionType.CASH_BUY),
                    (4, TransactionType.CARD_BUY),
                    # (5, DD buy - skip)
                    (6, TransactionType.TT_SELL),
                    (7, TransactionType.BILLS_SELL),
                    (8, TransactionType.CASH_SELL),
                    (9, TransactionType.CARD_SELL),
                    # (10, DD sell - skip)
                ]

                # Fallback for fewer columns
                col_mapping_4 = [
                    (1, TransactionType.TT_BUY),
                    (2, TransactionType.TT_SELL),
                    (3, TransactionType.CARD_BUY),
                    (4, TransactionType.CARD_SELL),
                ]

                col_mapping_2 = [
                    (1, TransactionType.CARD_BUY),
                    (2, TransactionType.CARD_SELL),
                ]

                num_cells = len(cells)
                if num_cells >= 11:
                    mapping = col_mapping_10
                elif num_cells >= 5:
                    mapping = col_mapping_4
                else:
                    mapping = col_mapping_2

                for cell_idx, transaction_type in mapping:
                    if cell_idx < num_cells:
                        rate_value = self.clean_rate(cells[cell_idx].get_text(strip=True))
                        if rate_value:
                            rates.append(ForexRate(
                                bank_name=self.bank_name,
                                currency_code=currency_code,
                                currency_name=currency_name,
                                transaction_type=transaction_type,
                                rate=rate_value,
                            ))

        return rates
