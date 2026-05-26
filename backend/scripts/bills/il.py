"""
bills/il.py — Illinois bill collector.

Source:  https://www.ilga.gov/legislation/grpapi/
Auth:    none
Tier:    B (XML bulk)
"""

import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch
from core.normalize import normalize_bill

STATE_CODE = "IL"
SOURCE = "il_leg"
PRIMARY_URL = "https://www.ilga.gov/legislation/grpapi/"


def collect() -> list[dict]:
    # TODO: implement XML bulk collector for Illinois
    # cursor = read_cursor(STATE_CODE)
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    normalized = [normalize_bill(r, STATE_CODE, SOURCE) for r in items]
    ingest_batch(normalized, "bill")
    write_cursor(STATE_CODE, {"last_id": None})
    print(f"[{SOURCE}] done — {len(normalized)} bills ingested")
