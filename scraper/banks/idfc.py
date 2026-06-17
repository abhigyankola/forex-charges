import re
from typing import List

from bs4 import BeautifulSoup

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, CURRENCY_NAMES, TransactionType
from scraper.models import ForexRate, ForexData


class IDFCScraper(BaseScraper):
    """Scraper for IDFC First Bank forex rates."""

    def __init__(self):
        super().__init__("IDFC", BANK_URLS["IDFC"])

    def scrape(self) -> ForexData:
        html_content = self.get_page_content(use_selenium=True)

        if not html_content:
            print("Failed to get IDFC page content")
            return self.forex_data

        soup = self.parse_soup(html_content)
        rates = self.parse_rates(soup)
        self.forex_data.add_rates(rates)
        return self.forex_data

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        rates = []

        rate_rows = soup.find_all("tr", id="tableRow")

        if not rate_rows:
            table = soup.find("table")
            if table:
                rate_rows = table.find_all("tr")
                rate_rows = [
                    row
                    for row in rate_rows
                    if row.find("td") and len(row.find_all("td")) >= 7
                ]

        for row in rate_rows:
            cells = row.find_all("td")
            if len(cells) < 7:
                continue
            try:
                currency_pair = cells[0].get_text(strip=True)
                currency_match = re.match(r"([A-Z]{3})INR", currency_pair)
                if not currency_match:
                    continue

                currency_code = currency_match.group(1)
                currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

                rate_mappings = [
                    (1, TransactionType.BILLS_BUY),
                    (2, TransactionType.BILLS_SELL),
                    (3, TransactionType.TT_BUY),
                    (4, TransactionType.TT_SELL),
                    (5, TransactionType.CARD_BUY),
                    (6, TransactionType.CARD_SELL),
                ]

                for cell_idx, transaction_type in rate_mappings:
                    if cell_idx < len(cells):
                        rate_value = self.clean_rate(cells[cell_idx].get_text(strip=True))
                        if rate_value and rate_value > 0:
                            rates.append(ForexRate(
                                bank_name=self.bank_name,
                                currency_code=currency_code,
                                currency_name=currency_name,
                                transaction_type=transaction_type,
                                rate=rate_value,
                            ))
            except Exception as e:
                print(f"Error parsing IDFC rate row: {e}")
                continue

        return rates
