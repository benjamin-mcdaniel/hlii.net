"""
core/normalize.py — normalize raw collector output to the HLII bill schema.

Each state collector returns dicts in whatever shape the source provides.
Call normalize_bill() before passing items to ingest_batch().
"""


def normalize_bill(raw: dict, state_code: str, source: str) -> dict:
    """Return a dict conforming to the HLII bills table schema.

    Args:
        raw:        Raw dict from the state collector.
        state_code: Two-letter state abbreviation (or 'us' for federal).
        source:     Source identifier string, e.g. 'congress', 'ny_openleg'.
    """
    return {
        "id": f"{source}:{raw.get('source_id') or raw.get('id')}",
        "source": source,
        "jurisdiction": state_code.lower(),
        "chamber": _normalize_chamber(raw.get("chamber", "")),
        "title": raw.get("title") or raw.get("name") or raw.get("short_title") or "",
        "description": raw.get("description") or raw.get("summary") or "",
        "status": _normalize_status(raw.get("status") or raw.get("status_desc") or ""),
        "introduced_date": raw.get("introduced_date") or raw.get("file_date"),
        "last_action_date": raw.get("last_action_date") or raw.get("status_date"),
        "url": raw.get("url") or raw.get("state_link") or "",
        "full_text": raw.get("full_text"),
    }


def _normalize_chamber(raw: str) -> str:
    s = raw.lower()
    if "senate" in s or s == "s":
        return "senate"
    if "house" in s or "assembly" in s or s == "h":
        return "house"
    if "unicameral" in s or "legislature" in s:
        return "unicameral"
    if "council" in s:
        return "council"
    return "unknown"


def _normalize_status(raw: str) -> str:
    s = raw.lower()
    if any(w in s for w in ("sign", "enacted", "chaptered", "effective")):
        return "signed"
    if "veto" in s:
        return "vetoed"
    if any(w in s for w in ("pass", "engross", "enrolled")):
        return "passed_chamber"
    if "committee" in s:
        return "committee"
    return "introduced"
