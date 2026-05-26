"""
core/cursor.py — last-run cursor for incremental collection.

GitHub Actions caches .cursor/{state}.json between runs so each collector
only fetches records newer than the previous successful run.
"""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

CURSOR_DIR = Path(".cursor")


def read_cursor(key: str) -> dict:
    """Return the saved cursor for `key`, or an empty cursor if none exists."""
    path = CURSOR_DIR / f"{key.lower()}.json"
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {"last_run": None, "last_id": None}


def write_cursor(key: str, cursor: dict) -> None:
    """Persist `cursor` dict for `key` so the next run can resume from here."""
    CURSOR_DIR.mkdir(exist_ok=True)
    path = CURSOR_DIR / f"{key.lower()}.json"
    path.write_text(
        json.dumps({**cursor, "updated_at": datetime.now(timezone.utc).isoformat()})
    )
    print(f"[cursor] saved {path}")
