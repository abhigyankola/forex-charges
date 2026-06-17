# Forex Rates Comparison - India

A comprehensive scraping and comparison tool for forex exchange rates from major Indian banks.

## Supported Banks

- **HSBC** - Web scraping (Selenium)
- **ICICI** - Web scraping (Selenium)
- **AXIS** - Web scraping (Selenium with dropdown interaction)
- **IDFC** - Web scraping (Selenium)
- **IOB** - Web scraping (Selenium, ASP.NET GridView)
- **KOTAK** - Web scraping (Selenium)
- **SBI** - PDF download + extraction (pdfplumber)
- **HDFC** - Web scraping (Selenium)

## Installation

```bash
git clone <repository-url>
cd forex-charges
pip install -r requirements.txt
```

## Usage

### Scrape All Banks

Run from the project root:

```bash
python -m scraper
```

This will:

- Run all bank scrapers sequentially
- Save combined data to `data/all_banks_rates.json`
- Generate a summary report at `data/scraping_summary.json`

### Use as a Library

```python
from scraper.banks import HSBCScraper, AXISScraper
from scraper.runner import run_all_scrapers

# Run a single scraper
scraper = HSBCScraper()
forex_data = scraper.run()

# Run all scrapers
results, all_data = run_all_scrapers()
```

## Project Structure

```
forex-charges/
├── scraper/
│   ├── __init__.py          # Package init
│   ├── __main__.py          # python -m scraper entry point
│   ├── base.py              # Base scraper class
│   ├── models.py            # ForexRate / ForexData models
│   ├── constants.py         # Transaction types, currency maps, bank URLs
│   ├── runner.py            # Orchestrator that runs all scrapers
│   └── banks/
│       ├── __init__.py      # Exports all scraper classes
│       ├── hsbc.py
│       ├── icici.py
│       ├── axis.py
│       ├── idfc.py
│       ├── iob.py
│       ├── kotak.py
│       ├── hdfc.py
│       └── sbi.py
├── data/                    # Scraped data (JSON files)
├── requirements.txt
└── README.md
```

## Transaction Types

All scrapers output rates using these standardized types:

| Type | Description |
|------|-------------|
| `tt_buy` / `tt_sell` | Telegraphic transfer (wire) |
| `card_buy` / `card_sell` | Forex / travel card |
| `cash_buy` / `cash_sell` | Physical currency notes |
| `bills_buy` / `bills_sell` | Bills / demand drafts |

## Data Format

Each rate entry:

```json
{
  "bank_name": "HSBC",
  "currency_code": "USD",
  "currency_name": "US Dollar",
  "transaction_type": "tt_buy",
  "rate": 84.25,
  "base_currency": "INR",
  "scraped_at": "2024-01-15T10:30:00"
}
```

## Notes

- All exchange rates are quoted in INR (Indian Rupees).
- Rates are scraped from public bank websites.
- Scrapers may need updates if a bank changes its website structure.
- Chrome/Chromium is required for Selenium-based scrapers.

## License

This project is for educational and personal use. Please respect the terms of service of the respective bank websites.
