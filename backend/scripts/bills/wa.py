"""
bills/wa.py — Washington State SOAP XML Web Services collector.

Source:  https://wslwebservices.leg.wa.gov
Auth:    none (free, no key required)
Tier:    A (SOAP XML)
Docs:    https://wslwebservices.leg.wa.gov/legislationservice.asmx
"""

import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch
from core.normalize import normalize_bill

STATE_CODE = "wa"
SOURCE = "wa_lws"
BASE_URL = "https://wslwebservices.leg.wa.gov/legislationservice.asmx"


def collect() -> list[dict]:
    # TODO: implement SOAP calls using requests + lxml
    # Operation: GetLegislationByYear / GetLegislationByRequestNumber
    # SOAP envelope template: POST text/xml to BASE_URL
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    normalized = [normalize_bill(r, STATE_CODE, SOURCE) for r in items]
    ingest_batch(normalized, "bill")
    write_cursor(STATE_CODE, {"last_id": None})
    print(f"[{SOURCE}] done — {len(normalized)} bills ingested")
