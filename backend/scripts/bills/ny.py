"""
bills/ny.py — New York OpenLegislation API collector.

Source:  https://legislation.nysenate.gov/api/3
Auth:    NY_OPENLEG_KEY (GitHub Actions secret)
Tier:    A (REST JSON API)
Docs:    https://legislation.nysenate.gov/static/docs/html/index.html
"""

import os
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch
from core.normalize import normalize_bill

STATE_CODE = "ny"
SOURCE = "ny_openleg"
API_KEY = os.environ.get("NY_OPENLEG_KEY", "")
BASE_URL = "https://legislation.nysenate.gov/api/3"


def collect() -> list[dict]:
    # TODO: implement OpenLegislation bill search with cursor-based pagination
    # Endpoint: GET /api/3/bills/{session_year}?key={key}&limit=1000&offset=...
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    normalized = [normalize_bill(r, STATE_CODE, SOURCE) for r in items]
    ingest_batch(normalized, "bill")
    write_cursor(STATE_CODE, {"last_id": None})
    print(f"[{SOURCE}] done — {len(normalized)} bills ingested")
