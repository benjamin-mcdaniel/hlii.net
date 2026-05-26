"""
courts/scotusblog.py — SCOTUSblog RSS collector for orders, memos, cert grants/denials.

Source:  https://www.scotusblog.com/feed/
Auth:    none
Notes:   Supplements CourtListener for SCOTUS orders lists and memos which
         CourtListener does not classify as cleanly. Doc types tracked:
         orders list, cert grant, cert denial, argument recap, opinion recap.
"""

import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent))

from core.cursor import read_cursor, write_cursor
from core.ingest import ingest_batch

SOURCE = "scotusblog"
CURSOR_KEY = "scotusblog"
RSS_URL = "https://www.scotusblog.com/feed/"


def collect() -> list[dict]:
    # TODO: implement feedparser RSS collector
    # import feedparser
    # cursor = read_cursor(CURSOR_KEY)
    # feed = feedparser.parse(RSS_URL)
    # Filter entries newer than cursor["last_run"]
    # Classify each entry as: order | cert_grant | cert_denied | memo | opinion_recap
    print(f"[{SOURCE}] stub — not yet implemented")
    return []


if __name__ == "__main__":
    items = collect()
    ingest_batch(items, "opinion")
    write_cursor(CURSOR_KEY, {"last_id": None})
    print(f"[{SOURCE}] done — {len(items)} items ingested")
