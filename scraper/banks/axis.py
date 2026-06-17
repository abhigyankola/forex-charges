import time
from typing import List

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

from scraper.base import BaseScraper
from scraper.constants import BANK_URLS, CURRENCY_NAMES, TransactionType
from scraper.models import ForexRate, ForexData


class AXISScraper(BaseScraper):
    """Scraper for AXIS Bank forex rates."""

    def __init__(self):
        super().__init__("AXIS", BANK_URLS["AXIS"])

    def scrape(self) -> ForexData:
        rates = self._scrape_with_dropdown()
        if rates:
            self.forex_data.add_rates(rates)
            print(f"AXIS: Successfully scraped {len(rates)} rates")
        else:
            print("AXIS: No rates found")
        return self.forex_data

    def _scrape_with_dropdown(self) -> List[ForexRate]:
        rates = []

        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")

        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()), options=chrome_options
        )

        try:
            driver.get(self.url)
            wait = WebDriverWait(driver, 10)

            dropdown = wait.until(
                EC.presence_of_element_located((By.ID, "contentSelect"))
            )
            select = Select(dropdown)
            select.select_by_visible_text("All")

            time.sleep(3)

            html_content = driver.page_source
            soup = BeautifulSoup(html_content, "html.parser")

            desktop_table = soup.find("table", id="grdCountry")
            if not desktop_table:
                desktop_table = soup.find("table", class_="hidden-xs")

            if desktop_table:
                rates.extend(self._parse_desktop_table(desktop_table))

            mobile_tables = soup.find_all("table", class_="hidden-md")
            for table in mobile_tables:
                rates.extend(self._parse_mobile_table(table))

        except Exception as e:
            print(f"Error scraping AXIS with dropdown: {e}")
        finally:
            driver.quit()

        return rates

    def _parse_desktop_table(self, table) -> List[ForexRate]:
        rates = []

        all_rows = table.find_all("tr")
        rows = [
            row
            for row in all_rows
            if row.get("class") and "dataRow" in " ".join(row.get("class", []))
        ]

        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) < 10:
                continue

            currency_name = cells[1].get_text(strip=True)
            currency_code = cells[2].get_text(strip=True)

            rate_values = []
            for i in range(3, 11):
                if i < len(cells):
                    rate_text = cells[i].get_text(strip=True)
                    try:
                        rate_values.append(float(rate_text))
                    except ValueError:
                        rate_values.append(None)

            rate_types = [
                (TransactionType.TT_BUY, 0),
                (TransactionType.TT_SELL, 1),
                (TransactionType.BILLS_BUY, 2),
                (TransactionType.BILLS_SELL, 3),
                (TransactionType.CARD_BUY, 4),
                (TransactionType.CARD_SELL, 5),
                (TransactionType.CASH_BUY, 6),
                (TransactionType.CASH_SELL, 7),
            ]

            for rate_type, index in rate_types:
                if index < len(rate_values) and rate_values[index]:
                    rates.append(ForexRate(
                        bank_name=self.bank_name,
                        currency_code=currency_code,
                        currency_name=currency_name,
                        transaction_type=rate_type,
                        rate=rate_values[index],
                    ))

        return rates

    def _parse_mobile_table(self, table) -> List[ForexRate]:
        rates = []

        header = table.find("th", colspan="2")
        if not header:
            return rates

        currency_spans = header.find_all("span")
        if len(currency_spans) < 2:
            return rates

        currency_code = currency_spans[1].get_text(strip=True)
        rate_rows = table.find_all("tr", class_="innerTr-links")

        for row in rate_rows:
            cells = row.find_all("td")
            if len(cells) != 2:
                continue
            rate_type_text = cells[0].get_text(strip=True)
            rate_value_text = cells[1].get_text(strip=True)

            try:
                rate_value = float(rate_value_text)
                rate_type = self._map_rate_type(rate_type_text)
                if rate_type and currency_code:
                    rates.append(ForexRate(
                        bank_name=self.bank_name,
                        currency_code=currency_code,
                        currency_name=CURRENCY_NAMES.get(currency_code, currency_code),
                        transaction_type=rate_type,
                        rate=rate_value,
                    ))
            except ValueError:
                continue

        return rates

    @staticmethod
    def _map_rate_type(axis_type: str) -> str | None:
        mapping = {
            "TT Buy": TransactionType.TT_BUY,
            "TT Sell": TransactionType.TT_SELL,
            "Bill Buy": TransactionType.BILLS_BUY,
            "Bill Sell": TransactionType.BILLS_SELL,
            "TC Buy": TransactionType.CARD_BUY,
            "TC Sell": TransactionType.CARD_SELL,
            "CCY Buy": TransactionType.CASH_BUY,
            "CCY Sell": TransactionType.CASH_SELL,
        }
        return mapping.get(axis_type)

    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        return []
