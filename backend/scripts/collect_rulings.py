"""Placeholder collector for court rulings.

Same pattern as collect_bills.py — runs in GH Actions, normalizes a batch, and
POSTs to backend.hlii.net/ingest/rulings.

Secrets read from env:
  - HLII_INGEST_URL    : full URL (e.g. https://backend.hlii.net/ingest/rulings)
  - HLII_INGEST_TOKEN  : shared secret matching the backend worker's INGEST_TOKEN
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

import requests


SAMPLE_ITEMS = [
    {
        "id": "scotus-2025-03",
        "court": "scotus",
        "decided_date": "2025-03-22",
        "case": "Sample v. Placeholder",
        "outcome": "reverse",
        "subject": "regulatory",
    },
    {
        "id": "ca09-2025-118",
        "court": "ca9",
        "decided_date": "2025-04-11",
        "case": "Example Holdings v. State (placeholder)",
        "outcome": "affirm",
        "subject": "civil",
    },
]


def collect() -> list[dict]:
    return SAMPLE_ITEMS


def main() -> int:
    ingest_url = os.environ.get("HLII_INGEST_URL")
    ingest_token = os.environ.get("HLII_INGEST_TOKEN")

    if not ingest_url or not ingest_token:
        print("HLII_INGEST_URL and HLII_INGEST_TOKEN must be set", file=sys.stderr)
        return 2

    items = collect()
    payload = {
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "source": "stub:sample",
        "items": items,
    }

    response = requests.post(
        ingest_url,
        headers={
            "Content-Type": "application/json",
            "X-Ingest-Token": ingest_token,
        },
        data=json.dumps(payload),
        timeout=30,
    )

    print(f"POST {ingest_url} → {response.status_code}")
    print(response.text)
    response.raise_for_status()
    return 0


if __name__ == "__main__":
    sys.exit(main())
