import re
from typing import List

from bs4 import BeautifulSoup

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, CURRENCY_NAMES, TransactionType
from scraper.models import ForexRate, ForexData


class IOBScraper(BaseScraper):
    """Scraper for Indian Overseas Bank forex rates.

    Source: https://www.iob.bank.in/en/forex-rates
    Table columns: Unit | Currency | TT Buy | TT Sell | Bill Buy | Bill Sell
    """

    def __init__(self):
        super().__init__("IOB", BANK_URLS["IOB"])

    def scrape(self) -> ForexData:
        html_content = self.get_page_content(use_selenium=True)

        if not html_content:
            print("Failed to get IOB page content")
            return self.forex_data

        soup = self.parse_soup(html_content)
        rates = self.parse_rates(soup)
        self.forex_data.add_rates(rates)
        return self.forex_data

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        rates = []

        rate_table = self._find_rate_table(soup)
        if not rate_table:
            print("Could not find rate table in IOB page")
            return rates

        rows = rate_table.find_all("tr")

        for row in rows:
            cells = row.find_all("td")
            if len(cells) < 6:
                continue
            try:
                units_text = cells[0].get_text(strip=True)
                units = int(units_text) if units_text.isdigit() else 1

                currency_code = cells[1].get_text(strip=True).upper().strip()

                if not re.match(r"^[A-Z]{3}$", currency_code):
                    continue

                currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

                rate_mappings = [
                    (2, TransactionType.TT_BUY),
                    (3, TransactionType.TT_SELL),
                    (4, TransactionType.BILLS_BUY),
                    (5, TransactionType.BILLS_SELL),
                ]

                for cell_idx, transaction_type in rate_mappings:
                    if cell_idx < len(cells):
                        rate_value = self.clean_rate(cells[cell_idx].get_text(strip=True))
                        if rate_value and rate_value > 0:
                            adjusted_rate = rate_value / units
                            rates.append(ForexRate(
                                bank_name=self.bank_name,
                                currency_code=currency_code,
                                currency_name=currency_name,
                                transaction_type=transaction_type,
                                rate=adjusted_rate,
                            ))
            except Exception as e:
                print(f"Error parsing IOB rate row: {e}")
                continue

        return rates

    @staticmethod
    def _find_rate_table(soup: BeautifulSoup):
        """Find the forex rate table by looking for currency data patterns."""
        tables = soup.find_all("table")
        for table in tables:
            text = table.get_text(strip=True).upper()
            if "USD" in text and "EUR" in text and "GBP" in text:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all("td")
                    if len(cells) >= 6:
                        cell_text = cells[1].get_text(strip=True).upper()
                        if re.match(r"^[A-Z]{3}$", cell_text):
                            return table
        return None
