"""
bills/tx.py — Texas Legislature FTP bulk download collector.

Source:  ftp://ftp.legis.state.tx.us/
Auth:    none (anonymous FTP)
Tier:    B (FTP bulk)
Notes:   Texas Legislative Council prohibits scraping capitol.texas.gov directly.
         Use the anonymous FTP endpoint instead. Regular session = odd years only.
         FTP layout: /bills/{session}/{doctype}/{format}/{type}/{group-of-100}/
"""

import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch
from core.normalize import normalize_bill

STATE_CODE = "tx"
SOURCE = "tx_ftp"
FTP_HOST = "ftp.legis.state.tx.us"


def collect() -> list[dict]:
    # TODO: implement anonymous FTP pull using ftplib
    # 1. Connect to FTP_HOST anonymously
    # 2. List /bills/{current_session}/ directory
    # 3. Download changed files since last cursor run
    # 4. Parse bill XML/text files into raw dicts
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    normalized = [normalize_bill(r, STATE_CODE, SOURCE) for r in items]
    ingest_batch(normalized, "bill")
    write_cursor(STATE_CODE, {"last_id": None})
    print(f"[{SOURCE}] done — {len(normalized)} bills ingested")
