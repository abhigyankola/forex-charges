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

        tables = soup.find_all("table", class_=re.compile(r"rate|forex|currency", re.I))

        for table in tables:
            rows = table.find_all("tr")

            for row in rows:
                cells = row.find_all("td")
                if len(cells) < 3:
                    continue
                try:
                    currency_text = cells[0].get_text(strip=True)
                    currency_match = re.search(r"([A-Z]{3})", currency_text)
                    if not currency_match:
                        continue

                    currency_code = currency_match.group(1)
                    currency_name = re.sub(r"[A-Z]{3}", "", currency_text).strip(" -")

                    rate_mappings = [
                        (1, TransactionType.CARD_BUY),
                        (2, TransactionType.CARD_SELL),
                    ]

                    for cell_idx, transaction_type in rate_mappings:
                        if cell_idx < len(cells):
                            rate_value = self.clean_rate(cells[cell_idx].get_text(strip=True))
                            if rate_value:
                                rates.append(ForexRate(
                                    bank_name=self.bank_name,
                                    currency_code=currency_code,
                                    currency_name=currency_name,
                                    transaction_type=transaction_type,
                                    rate=rate_value,
                                ))
                except Exception as e:
                    print(f"Error parsing ICICI rate row: {e}")
                    continue

        scripts = soup.find_all("script")
        for script in scripts:
            if script.string and "rates" in script.string.lower():
                try:
                    json_match = re.search(r"({.*?rates.*?})", script.string, re.S)
                    if json_match:
                        json.loads(json_match.group(1))
                except (json.JSONDecodeError, AttributeError):
                    continue

        if not rates:
            rate_containers = soup.find_all(
                "div", class_=re.compile(r"rate|forex|currency", re.I)
            )
            for container in rate_containers:
                currency_elements = container.find_all(text=re.compile(r"[A-Z]{3}"))
                for elem in currency_elements:
                    parent = elem.parent
                    if parent:
                        rate_texts = parent.find_all(text=re.compile(r"\d+\.?\d*"))
                        for rate_text in rate_texts:
                            rate_value = self.clean_rate(rate_text)
                            if rate_value:
                                pass

        return rates
