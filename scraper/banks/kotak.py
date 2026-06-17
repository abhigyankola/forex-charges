import re
from typing import List

from bs4 import BeautifulSoup

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, CURRENCY_NAMES, TransactionType
from scraper.models import ForexRate, ForexData


class KOTAKScraper(BaseScraper):
    """Scraper for Kotak Mahindra Bank forex rates."""

    def __init__(self):
        super().__init__("KOTAK", BANK_URLS["KOTAK"])

    def scrape(self) -> ForexData:
        html_content = self.get_page_content(use_selenium=True)

        if not html_content:
            print("Failed to get KOTAK page content")
            return self.forex_data

        soup = self.parse_soup(html_content)
        rates = self.parse_rates(soup)
        self.forex_data.add_rates(rates)
        return self.forex_data

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        rates = []

        tables = soup.find_all("table", class_="table_1")

        for table in tables:
            rows = table.find_all("tr")
            current_section = None
            headers = []

            for row in rows:
                cells = row.find_all(["td", "th"])
                if not cells:
                    continue

                first_cell_text = cells[0].get_text(strip=True)
                if "We Buy" in first_cell_text:
                    current_section = "buy"
                    continue
                elif "We Sell" in first_cell_text:
                    current_section = "sell"
                    continue

                if len(cells) >= 4 and "CURRENCY" in cells[0].get_text(strip=True):
                    headers = [
                        cell.get_text(strip=True).lower().replace(" ", "_")
                        for cell in cells[1:]
                    ]
                    continue

                if len(cells) < 2 or not current_section or not headers:
                    continue

                currency_text = cells[0].get_text(strip=True)
                currency_match = re.match(r"^([A-Z]{3})", currency_text)
                if not currency_match:
                    continue

                currency_code = currency_match.group(1)
                currency_name = CURRENCY_NAMES.get(currency_code, currency_code)

                for i, cell in enumerate(cells[1:]):
                    if i >= len(headers):
                        break
                    rate_text = cell.get_text(strip=True)
                    if not rate_text:
                        continue
                    try:
                        rate = float(rate_text)
                        if currency_code == "JPY":
                            rate = rate / 100

                        transaction_type = self._map_transaction_type(
                            headers[i], current_section
                        )
                        rates.append(ForexRate(
                            bank_name=self.bank_name,
                            currency_code=currency_code,
                            currency_name=currency_name,
                            transaction_type=transaction_type,
                            rate=rate,
                        ))
                    except ValueError:
                        continue

        return rates

    @staticmethod
    def _map_transaction_type(header: str, section: str) -> str:
        if section == "buy":
            if "cash" in header:
                return TransactionType.CASH_BUY
            elif "forex_card" in header:
                return TransactionType.CARD_BUY
            elif "bills" in header:
                return TransactionType.BILLS_BUY
            elif "telegraphic_transfer" in header:
                return TransactionType.TT_BUY
        else:
            if "cash" in header:
                return TransactionType.CASH_SELL
            elif "forex_card" in header:
                return TransactionType.CARD_SELL
            elif "bills" in header:
                return TransactionType.BILLS_SELL
            elif "telegraphic_transfer" in header:
                return TransactionType.TT_SELL
        return f"{header}_{section}"
