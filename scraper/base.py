import time
from abc import ABC, abstractmethod
from typing import List, Optional

import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

from .models import ForexRate, ForexData


class BaseScraper(ABC):
    def __init__(self, bank_name: str, url: str):
        self.bank_name = bank_name
        self.url = url
        self.forex_data = ForexData()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/91.0.4472.124 Safari/537.36"
            )
        })

    def get_page_content(self, use_selenium: bool = False) -> Optional[str]:
        try:
            if use_selenium:
                return self._get_content_selenium()
            response = self.session.get(self.url, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching page content for {self.bank_name}: {e}")
            return None

    def _get_content_selenium(self) -> Optional[str]:
        driver = None
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
            driver.get(self.url)
            time.sleep(5)
            return driver.page_source
        except Exception as e:
            print(f"Error with Selenium for {self.bank_name}: {e}")
            return None
        finally:
            if driver:
                driver.quit()

    def parse_soup(self, html_content: str) -> BeautifulSoup:
        return BeautifulSoup(html_content, "html.parser")

    @abstractmethod
    def scrape(self) -> ForexData:
        pass

    @abstractmethod
    def parse_rates(self, soup: BeautifulSoup) -> List[ForexRate]:
        pass

    def clean_rate(self, rate_str: str) -> Optional[float]:
        try:
            cleaned = rate_str.strip().replace("₹", "").replace("Rs", "").replace(",", "").strip()
            return float(cleaned)
        except (ValueError, AttributeError):
            return None

    def run(self) -> ForexData:
        print(f"Starting scraper for {self.bank_name}...")
        try:
            forex_data = self.scrape()
            print(f"Successfully scraped {len(forex_data.rates)} rates from {self.bank_name}")
            return forex_data
        except Exception as e:
            print(f"Error running scraper for {self.bank_name}: {e}")
            return ForexData()
