import re
from typing import List

from bs4 import BeautifulSoup

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, TransactionType
from scraper.models import ForexRate, ForexData


class HSBCScraper(BaseScraper):
    """Scraper for HSBC forex rates."""

    def __init__(self):
        super().__init__("HSBC", BANK_URLS["HSBC"])

    def scrape(self) -> ForexData:
        html_content = self.get_page_content(use_selenium=True)

        if not html_content:
            print("Failed to get HSBC page content")
            return self.forex_data

        soup = self.parse_soup(html_content)
        rates = self.parse_rates(soup)
        self.forex_data.add_rates(rates)
        return self.forex_data

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        rates = []
        tables = soup.find_all("table")

        for table in tables:
            first_row = table.find("tr")
            if not first_row:
                continue

            headers = first_row.find_all(["th", "td"])
            header_texts = [h.get_text(strip=True).upper() for h in headers]

            if "FCY" not in header_texts and not any(
                kw in h for h in header_texts for kw in ("BILLS", "TT", "CURRENCY")
            ):
                continue

            rows = table.find_all("tr")[1:]

            rate_columns = {
                TransactionType.BILLS_BUY: next(
                    (i for i, h in enumerate(header_texts) if "BILLS BUY" in h), None
                ),
                TransactionType.BILLS_SELL: next(
                    (i for i, h in enumerate(header_texts) if "BILLS SELL" in h), None
                ),
                TransactionType.TT_BUY: next(
                    (i for i, h in enumerate(header_texts) if "TT BUY" in h), None
                ),
                TransactionType.TT_SELL: next(
                    (i for i, h in enumerate(header_texts) if "TT SELL" in h), None
                ),
                TransactionType.CASH_BUY: next(
                    (i for i, h in enumerate(header_texts) if "CURRENCY BUY" in h), None
                ),
                TransactionType.CASH_SELL: next(
                    (i for i, h in enumerate(header_texts) if "CURRENCY SELL" in h), None
                ),
            }

            for row in rows:
                cells = row.find_all("td")
                if len(cells) <= 1:
                    continue
                try:
                    currency_info = cells[0].get_text(strip=True)
                    currency_match = re.search(r"\(([A-Z]{3})\)", currency_info)
                    if currency_match:
                        currency_code = currency_match.group(1)
                        currency_name = currency_info.replace(f"({currency_code})", "").strip()
                    else:
                        currency_match = re.match(r"([A-Z]{3})\s*-?\s*(.*)", currency_info)
                        if currency_match:
                            currency_code = currency_match.group(1)
                            currency_name = currency_match.group(2).strip()
                        else:
                            continue

                    for rate_type, col_idx in rate_columns.items():
                        if col_idx is not None and col_idx < len(cells):
                            rate_value = self.clean_rate(cells[col_idx].get_text(strip=True))
                            if rate_value:
                                rates.append(ForexRate(
                                    bank_name=self.bank_name,
                                    currency_code=currency_code,
                                    currency_name=currency_name,
                                    transaction_type=rate_type,
                                    rate=rate_value,
                                ))
                except Exception as e:
                    print(f"Error parsing HSBC rate row: {e}")
                    continue

            if rates:
                break

        return rates
