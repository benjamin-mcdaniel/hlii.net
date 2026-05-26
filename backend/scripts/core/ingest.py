"""
core/ingest.py — shared ingest client for all HLII collectors.

Every collector builds a list of normalized dicts and calls ingest_batch().
This module handles batching, auth, retry, and the POST to the backend Worker.
"""

import os
import time
import json
import requests

INGEST_URL = "https://backend.hlii.net/ingest"
BATCH_SIZE = 50
INGEST_TOKEN = os.environ["HLII_INGEST_TOKEN"]


def ingest_batch(items: list[dict], doc_type: str) -> None:
    """POST items to the backend ingest Worker in batches of BATCH_SIZE.

    Args:
        items:    List of normalized bill or opinion dicts.
        doc_type: 'bill' or 'opinion'
    """
    if not items:
        print(f"[ingest] No items to ingest for type={doc_type}")
        return

    batches = [items[i : i + BATCH_SIZE] for i in range(0, len(items), BATCH_SIZE)]
    print(f"[ingest] {len(items)} items → {len(batches)} batch(es), type={doc_type}")

    for idx, batch in enumerate(batches, 1):
        _post_with_retry({"type": doc_type, "items": batch})
        print(f"[ingest] batch {idx}/{len(batches)} ok ({len(batch)} items)")
        if idx < len(batches):
            time.sleep(0.5)  # polite delay between batches


def _post_with_retry(payload: dict, retries: int = 3) -> None:
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(
                INGEST_URL,
                json=payload,
                headers={
                    "X-Ingest-Token": INGEST_TOKEN,
                    "Content-Type": "application/json",
                },
                timeout=30,
            )
            resp.raise_for_status()
            return
        except requests.RequestException as exc:
            if attempt == retries:
                raise RuntimeError(
                    f"Ingest failed after {retries} attempts: {exc}"
                ) from exc
            wait = 2 * attempt
            print(f"[ingest] attempt {attempt} failed ({exc}), retrying in {wait}s")
            time.sleep(wait)
