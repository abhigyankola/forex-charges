from datetime import datetime
from typing import List
from dataclasses import dataclass, asdict
import json


@dataclass
class ForexRate:
    bank_name: str
    currency_code: str
    currency_name: str
    transaction_type: str
    rate: float
    base_currency: str = "INR"
    scraped_at: datetime = None

    def __post_init__(self):
        if self.scraped_at is None:
            self.scraped_at = datetime.now()

    def to_dict(self):
        data = asdict(self)
        data["scraped_at"] = self.scraped_at.isoformat()
        return data

    @classmethod
    def from_dict(cls, data):
        data["scraped_at"] = datetime.fromisoformat(data["scraped_at"])
        return cls(**data)


class ForexData:
    def __init__(self):
        self.rates: List[ForexRate] = []

    def add_rate(self, rate: ForexRate):
        self.rates.append(rate)

    def add_rates(self, rates: List[ForexRate]):
        self.rates.extend(rates)

    def get_rates_by_currency(self, currency_code: str) -> List[ForexRate]:
        return [r for r in self.rates if r.currency_code == currency_code]

    def get_rates_by_bank(self, bank_name: str) -> List[ForexRate]:
        return [r for r in self.rates if r.bank_name == bank_name]

    def get_unique_currencies(self) -> List[str]:
        return list({r.currency_code for r in self.rates})

    def get_unique_banks(self) -> List[str]:
        return list({r.bank_name for r in self.rates})

    def to_json(self, filepath: str):
        data = [rate.to_dict() for rate in self.rates]
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    @classmethod
    def from_json(cls, filepath: str):
        forex_data = cls()
        with open(filepath, "r") as f:
            data = json.load(f)
        forex_data.rates = [ForexRate.from_dict(item) for item in data]
        return forex_data

    def to_dataframe(self):
        import pandas as pd
        return pd.DataFrame([rate.to_dict() for rate in self.rates])
