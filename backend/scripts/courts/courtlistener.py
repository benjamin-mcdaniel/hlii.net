"""
courts/courtlistener.py — CourtListener opinion collector.

Source:  https://www.courtlistener.com/api/rest/v4/opinions/
Auth:    none (free, unauthenticated — 5000 req/day limit)
Covers:  SCOTUS, all 13 federal circuits, most state supreme courts
Docs:    https://www.courtlistener.com/api/rest-info/
"""

import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch

SOURCE = "courtlistener"
CURSOR_KEY = "courts"
BASE_URL = "https://www.courtlistener.com/api/rest/v4"

# Courts to track: SCOTUS + all 13 federal circuits + state supreme courts
TARGET_COURTS = [
    "scotus",                                          # Supreme Court
    "ca1","ca2","ca3","ca4","ca5","ca6","ca7",         # Circuits 1-7
    "ca8","ca9","ca10","ca11","cadc","cafc",            # Circuits 8-11 + DC + Federal
]


def collect() -> list[dict]:
    # TODO: implement CourtListener REST API collector
    # cursor = read_cursor(CURSOR_KEY)
    # GET {BASE_URL}/opinions/?court__in={','.join(TARGET_COURTS)}&date_filed__gt={cursor['last_run']}
    # Map response to HLII opinion schema
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    ingest_batch(items, "opinion")
    write_cursor(CURSOR_KEY, {"last_id": None})
    print(f"[{SOURCE}] done — {len(items)} opinions ingested")
