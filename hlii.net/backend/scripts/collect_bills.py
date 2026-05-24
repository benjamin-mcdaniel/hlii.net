"""Placeholder collector for legislative bills.

Designed to run inside a GitHub Actions workflow on a schedule. It pulls a
batch from a public legislative source, normalizes it, and POSTs to the HLII
backend ingest endpoint at backend.hlii.net/ingest/bills.

Secrets read from env (set in the GH Actions workflow):
  - HLII_INGEST_URL    : full URL of the ingest endpoint (e.g. https://backend.hlii.net/ingest/bills)
  - HLII_INGEST_TOKEN  : shared secret matching the backend worker's INGEST_TOKEN
  - CONGRESS_API_KEY   : optional, key for api.congress.gov (or other source)

This is an MVP stub: it ships a small static sample so the pipeline is
runnable end-to-end before the real source is wired in.
"""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

import requests


SAMPLE_ITEMS = [
    {
        "id": "hr-1001-119",
        "congress": 119,
        "chamber": "house",
        "number": "HR1001",
        "title": "Sample appropriations bill (placeholder)",
        "topic": "fiscal:appropriations",
        "sponsor_party": "D",
        "introduced_date": "2025-01-14",
        "stage": "introduced",
    },
    {
        "id": "s-220-119",
        "congress": 119,
        "chamber": "senate",
        "number": "S220",
        "title": "Sample tax reauthorization (placeholder)",
        "topic": "fiscal:tax",
        "sponsor_party": "R",
        "introduced_date": "2025-02-03",
        "stage": "reported",
    },
]


def collect() -> list[dict]:
    """Return the batch of bills to ingest.

    Replace this with a real fetch from api.congress.gov (or similar) once the
    upstream source decision is made.
    """
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
