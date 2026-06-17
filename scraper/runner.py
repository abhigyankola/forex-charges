import json
from datetime import datetime
from pathlib import Path

from scraper.constants import PER_HUNDRED_THRESHOLDS
from scraper.models import ForexData
from scraper.banks import (
    HSBCScraper,
    ICICIScraper,
    AXISScraper,
    IDFCScraper,
    IOBScraper,
    KOTAKScraper,
    HDFCScraper,
    SBIScraper,
)

DATA_DIR = Path(__file__).parent.parent / "data"

SCRAPERS = [
    ("HSBC", HSBCScraper),
    ("ICICI", ICICIScraper),
    ("AXIS", AXISScraper),
    ("IDFC", IDFCScraper),
    ("IOB", IOBScraper),
    ("KOTAK", KOTAKScraper),
    ("SBI", SBIScraper),
    ("HDFC", HDFCScraper),
]


def run_all_scrapers():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    all_forex_data = ForexData()
    results = {}

    print("Starting forex rate scraping for all banks...\n")

    for bank_name, scraper_class in SCRAPERS:
        print(f"\n{'=' * 50}")
        print(f"Scraping {bank_name}...")
        print("=" * 50)

        try:
            scraper = scraper_class()
            forex_data = scraper.scrape()

            rate_count = len(forex_data.rates)
            results[bank_name] = {
                "status": "success",
                "rates_count": rate_count,
                "currencies": list({r.currency_code for r in forex_data.rates}),
            }

            all_forex_data.add_rates(forex_data.rates)
            print(f"✓ {bank_name}: Successfully scraped {rate_count} rates")

        except Exception as e:
            results[bank_name] = {
                "status": "error",
                "error": str(e),
                "rates_count": 0,
            }
            print(f"✗ {bank_name}: Error - {e}")

    _normalize_units(all_forex_data)
    all_forex_data.to_json(str(DATA_DIR / "all_banks_rates.json"))
    _create_summary_report(results, all_forex_data)

    return results, all_forex_data


def _normalize_units(forex_data: ForexData):
    """Normalize currencies that some banks quote per 100 units (e.g. JPY, LKR).

    Banks like HSBC/SBI/AXIS report JPY as ~58 (per 100 yen) while
    IOB/KOTAK/IDFC report ~0.58 (per 1 yen). This ensures all rates
    are per single unit.
    """
    fixed = 0
    for rate in forex_data.rates:
        threshold = PER_HUNDRED_THRESHOLDS.get(rate.currency_code)
        if threshold is not None and rate.rate > threshold:
            rate.rate = rate.rate / 100
            fixed += 1
    if fixed:
        print(f"\n✓ Normalized {fixed} per-100 rates to per-unit")


def _create_summary_report(results: dict, all_forex_data: ForexData):
    print("\n" + "=" * 70)
    print("SCRAPING SUMMARY REPORT")
    print("=" * 70)

    total_rates = len(all_forex_data.rates)
    unique_currencies = sorted({r.currency_code for r in all_forex_data.rates})
    unique_transaction_types = sorted({r.transaction_type for r in all_forex_data.rates})

    print(f"\nTotal rates collected: {total_rates}")
    print(f"Unique currencies: {len(unique_currencies)}")
    print(f"Unique transaction types: {len(unique_transaction_types)}")

    print("\nBank-wise Summary:")
    print("-" * 50)

    for bank, result in results.items():
        status_icon = "✓" if result["status"] == "success" else "✗"
        print(f"{status_icon} {bank}: {result['rates_count']} rates")
        if result["status"] == "success" and result.get("currencies"):
            currencies = sorted(result["currencies"])
            shown = ", ".join(currencies[:5])
            extra = f" + {len(currencies) - 5} more" if len(currencies) > 5 else ""
            print(f"  Currencies: {shown}{extra}")

    print("\n" + "=" * 70)
    print("CURRENCY AVAILABILITY MATRIX")
    print("=" * 70)

    banks = sorted(
        [bank for bank, r in results.items() if r["status"] == "success"]
    )

    currency_bank_matrix: dict[str, set[str]] = {}
    for rate in all_forex_data.rates:
        currency_bank_matrix.setdefault(rate.currency_code, set()).add(rate.bank_name)

    print(f"\n{'Currency':<10}", end="")
    for bank in banks:
        print(f"{bank:<8}", end="")
    print()
    print("-" * (10 + 8 * len(banks)))

    top_currencies = ["USD", "EUR", "GBP", "JPY", "AED", "SGD", "AUD", "CAD"]
    for currency in top_currencies:
        if currency not in currency_bank_matrix:
            continue
        print(f"{currency:<10}", end="")
        for bank in banks:
            mark = "✓" if bank in currency_bank_matrix[currency] else "-"
            print(f"{mark:<8}", end="")
        print()

    summary_data = {
        "scraping_date": datetime.now().isoformat(),
        "total_rates": total_rates,
        "unique_currencies": unique_currencies,
        "unique_transaction_types": unique_transaction_types,
        "bank_results": results,
        "currency_availability": {
            currency: sorted(bank_set)
            for currency, bank_set in currency_bank_matrix.items()
        },
    }

    summary_path = DATA_DIR / "scraping_summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary_data, f, indent=2)

    print(f"\n✓ Summary saved to {summary_path}")
    print(f"✓ Combined data saved to {DATA_DIR / 'all_banks_rates.json'}")
    print(f"\nTransaction types found: {', '.join(unique_transaction_types)}")
