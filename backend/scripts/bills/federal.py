"""
bills/federal.py — Congress.gov bill collector.

Source:  https://api.congress.gov/v3/bill
Auth:    CONGRESS_API_KEY (GitHub Actions secret)
Tier:    A (REST JSON API)
Docs:    https://api.congress.gov
"""

import os
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch
from core.normalize import normalize_bill

STATE_CODE = "us"
SOURCE = "congress"
API_KEY = os.environ.get("CONGRESS_API_KEY", "")
BASE_URL = "https://api.congress.gov/v3/bill"


def collect() -> list[dict]:
    # TODO: implement Congress.gov pagination using cursor
    # cursor = read_cursor(STATE_CODE)
    # params = {"api_key": API_KEY, "format": "json", "limit": 250, ...}
    # Fetch bills updated since cursor["last_run"]
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    normalized = [normalize_bill(r, STATE_CODE, SOURCE) for r in items]
    ingest_batch(normalized, "bill")
    write_cursor(STATE_CODE, {"last_id": None})
    print(f"[{SOURCE}] done — {len(normalized)} bills ingested")
